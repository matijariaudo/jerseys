const express = require('express');
const path = require('path');
const { dbConnection } = require('./dbcongfig');

const UserRouter = require('./js/routers/userRouters');
const ProductRouter = require('./js/routers/productRouters');
const PurchaseRouter = require('./js/routers/purchaseRouters');

const axios = require('axios');
const { Purchase } = require('./js/models');
const { createProducts } = require('./add');
const { sendEmail } = require('./js/helpers/sendEmail');
const PaymenteRouter = require('./js/routers/paymentRouters');

require('dotenv').config();


const app = express();
const PORT = process.env.PORT; 
const urlPayment=process.env.ISPRODUCTION?`api-m.paypal.com`:`www.sandbox.paypal.com`

// Middleware para parsear application/json
app.use(express.json());

async function getAccessToken() {
  console.log(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`)
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');
  const response = await axios.post('https://api-m.paypal.com/v1/oauth2/token', 'grant_type=client_credentials', {
      headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
      }
  });
  return response.data.access_token;
}

// Middleware para servir archivos estáticos desde la carpeta 'public'
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));
app.use('/products/assets', express.static(path.join(__dirname, 'public/assets')));
app.use('/product/assets', express.static(path.join(__dirname, 'public/assets')));
app.use('/products/:sport/assets', express.static(path.join(__dirname, 'public/assets')));
app.use('/products/:sport/:category/assets', express.static(path.join(__dirname, 'public/assets')));
app.use('/products/:sport/:category/:team/assets', express.static(path.join(__dirname, 'public/assets')));

app.use((req,res,next)=>{
  res.clearCookie('sport');res.clearCookie('category');res.clearCookie('team');res.clearCookie('productCode');next()
})

// Ruta para crear una orden y redirigir al usuario a PayPal
app.get('/pay/:id', async (req, res) => {
  const {id}=req.params;
  const purchase=await Purchase.findById(id);
  if(!purchase){return res.json({error:"Error"})}
  const {totalAmount}=purchase;
  purchase.status='pending';
  purchase.save()
  const accessToken = await getAccessToken();
  // Crear una orden
  const order = await axios.post(`https://${urlPayment}/v1/oauth2/tokenhttps://api-m.sandbox.paypal.com/v2/checkout/orders`, {
      intent: 'CAPTURE',
      purchase_units: [{
          amount: {
              currency_code: 'USD',
              value: totalAmount // Cambia el monto si lo necesitas
          }
      }],
      application_context: {
          return_url: `http://localhost:8000/success/${id}`,
          cancel_url: 'http://localhost:8000/cancel',
          user_action: 'PAY_NOW',
          shipping_preference: 'NO_SHIPPING' // Deshabilita la solicitud de dirección de envío
      }
  }, {
      headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
      }
});

  // Redirige a PayPal para completar el pago
  const approvalUrl = order.data.links.find(link => link.rel === 'approve').href;
  const token=approvalUrl.split("token=")[1];
  const url=`https://${urlPayment}/checkoutweb/signup?token=${token}`
  res.redirect(url);
});

// Ruta de éxito para capturar el pago después de que el usuario complete la transacción
app.get('/success/:idPurchase', async (req, res) => {
  const { idPurchase }=req.params
  const purchase=await Purchase.findById(idPurchase);
  if(!purchase){return res.json({error:"Error"})}
  const { token } = req.query;
  const accessToken = await getAccessToken();

  // Captura el pago - Convierto el pendiente a cobro en la tarjeta del usuario
  const capture = await axios.post(`https://${urlPayment}/v2/checkout/orders/${token}/capture`, {}, {
      headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
      }
  });
  const { id: captureId, status, purchase_units } = capture?.data || {id:null,status:null,purchase_units:null};
  const payment=extractPaymentDetails(purchase_units);
  const {amount,currency,paypalFee,netAmount}=payment;
  if(status=='COMPLETED'){
    purchase.status='completed';
    purchase.payment={amount,currency,paypalFee,netAmount}
    purchase.save();
  }
  res.redirect(`/orders/${idPurchase}`);
});

app.get('/sitemap', async(req, res) => {return res.sendFile(path.join(__dirname,'public', 'sitemap.xml'))});
app.get('/sitemap.xml', async(req, res) => {return res.sendFile(path.join(__dirname,'public', 'sitemap.xml'))});
app.get('/robots.txt', async(req, res) => {return res.sendFile(path.join(__dirname,'public', 'robots.txt'))});

app.use('/api',UserRouter)
app.use('/api',ProductRouter)
app.use('/api',PurchaseRouter)
app.get('/api/production', (req, res) => {
  isProduction=process.env.ISPRODUCTION 
  res.status(200).json({ isProduction });
});
app.use('/api',PaymenteRouter);
app.get('/register', async(req, res) => {res.cookie('action', "register");return res.sendFile(path.join(__dirname,'public', 'user.html'))});
app.get('/login', async(req, res) => {res.cookie('action', "login");return res.sendFile(path.join(__dirname,'public', 'user.html'))});
app.get('/user', async(req, res) => {res.cookie('action', "user");return res.sendFile(path.join(__dirname,'public', 'user.html'))});
app.get('/checkout', async(req, res) => {return res.sendFile(path.join(__dirname,'public', 'checkout.html'))});
app.get('/cart', async(req, res) => {return res.sendFile(path.join(__dirname,'public', 'cart.html'))});
app.get('/products', async(req, res) => {res.cookie('sports',"All");return res.sendFile(path.join(__dirname,'public', 'list.html'))});
app.get('/product/:code', async(req, res) => {
  const {code}=req.params;
  res.cookie('productCode',code);
  return res.sendFile(path.join(__dirname,'public', 'product-details.html'))
});
app.get('/products/:sport', async(req, res) => {
  const {sport}=req.params;
  res.cookie('sport',sport);
  return res.sendFile(path.join(__dirname,'public', 'list.html'))
});
app.get('/products/:sport/:category', async(req, res) => {
  const {sport,category}=req.params
  res.cookie('sport',sport);
  res.cookie('category',category);
  return res.sendFile(path.join(__dirname,'public', 'list.html'))
});
app.get('/products/:sport/:category/:team', async(req, res) => {
  const {sport,category,team}=req.params
  res.cookie('sport',sport);
  res.cookie('category',category);
  res.cookie('team',team);
  return res.sendFile(path.join(__dirname,'public', 'list.html'))
});

app.get('*', async(req, res) => {
  return res.sendFile(path.join(__dirname,'public', 'index.html'))
});


// Inicia el servidor
app.listen(PORT, async() => {
  console.log("Conectando BD")
  await dbConnection();
  //sendEmail({email:"matiariaudo@gmail.com",subject:"Welcome to xJersey",typeNro:1,body});
  await createProducts();
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

function extractPaymentDetails(captureData) {
  const purchaseUnit = captureData[0]; // Asumiendo que solo hay un `purchase_unit`
  const captureDetails = purchaseUnit.payments.captures[0]; // Asumiendo que solo hay una captura

  const paymentDetails = {
      amount: captureDetails.amount.value, // Monto pagado
      currency: captureDetails.amount.currency_code, // Moneda de pago
      paypalFee: captureDetails.seller_receivable_breakdown.paypal_fee.value, // Comisión de PayPal
      netAmount: captureDetails.seller_receivable_breakdown.net_amount.value, // Monto neto recibido
      receivableAmount: captureDetails.seller_receivable_breakdown.receivable_amount.value, // Monto recibido en la moneda local
      receivableCurrency: captureDetails.seller_receivable_breakdown.receivable_amount.currency_code, // Monto recibido en la moneda local
      exchangeRate: captureDetails.seller_receivable_breakdown.exchange_rate.value // Tipo de cambio
  };

  return paymentDetails;
}