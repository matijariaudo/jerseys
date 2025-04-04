require('dotenv').config()
const axios = require('axios');
const { Purchase } = require('../models');
const { sendEmail } = require('../helpers/sendEmail');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const PAYPAL_API = process.env.ISPRODUCTION!="false"?`https://api-m.paypal.com`:'https://api-m.sandbox.paypal.com';
const CLIENT_ID= process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET= process.env.PAYPAL_SECRET;

const createOrder=async (req, res) => {
    const { purchaseId } = req.body;
    const purchase=await Purchase.findById(purchaseId)
    try {
      const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: purchase.totalAmount
            }
          }
        ],
        "payment_source": {
            "paypal": 
            {
                "experience_context": 
                {
                    "shipping_preference": "NO_SHIPPING"
                }
            }
        },
        payer: {
          name:  {
            given_name:purchase.name,
            surname:purchase.surname
          },
          email_address: purchase.email,
          address: {
            postal_code: purchase.postCode,
            country_code: purchase.countryCode
          },
          phone: {
            phone_number: {
              national_number: purchase.phone // Aquí se agrega el número de teléfono
            }
          }
        },
        shipping_preference: 'NO_SHIPPING'
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
        }
      });
      res.json(response.data); // Devuelve el `orderID` al cliente
    } catch (err) {
      console.error(err);
      res.status(500).send('Error creating order');
    }
}

 // Ruta para capturar el pago
 const capturePayment=async (req, res) => {
    const { orderID ,purchaseId} = req.body;
    try {
      const purchase=await Purchase.findById(purchaseId)
      if(!purchase){throw new Error('No purchase found');}
      const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {}, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
      }
      });
      const payment=extractPaymentDetails(response.data);
      purchase.payment=payment;
      purchase.status='inProcess';
      await purchase.save()
      body=`<p> Your purchase has been successful, we have received your payment.<br>Use your orderID (${purchaseId}) to track your order. Log in to your account with your email address, or create one if you don't have one (with this email address) to see the status of your order.<br><br>Payment reference: ${payment.paypalId}</p>`
      try {
        sendEmail({email:purchase.email,subject:"Your purchase has been successful",body,typeNro:4});
        sendEmail({email:"xjerseyweb@gmail.com",subject:"Your purchase has been successful",body,typeNro:4});
      }finally {
        // Este bloque se ejecuta siempre, incluso si hay un error (puede estar vacío)
        return res.json({status: "OK"}); // Devuelve los detalles de la transacción
      }
    } catch (err) {
      console.log(err)
      return res.status(500).send({message:'Error capturing order',error:err.message});
    }
  }


// Crear carpeta /transferencias si no existe
const dir = './public/assets/images/transferencias';
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dir+'/'),
  filename: (req, file, cb) => cb(null, req.body.purchaseId+`${file.fieldname=='file1'?'_comprobante':'_dni'}`+ path.extname(file.originalname))
});

const multerUpload = multer({ storage }).fields([
  { name: 'file1', maxCount: 1 }, // PDF o imagen
  { name: 'file2', maxCount: 1 }  // Solo imagen
]);

const paymentByTransfer=async(req, res) => {
  const {purchaseId}=req.body;
  try {
    const purchase=await Purchase.findById(purchaseId);
    if(!purchase){
      throw new Error('Purchase no found.')
    }
    purchase.payment={document: req.files['file1']?.[0]?.filename+"//"+req.files['file2']?.[0]?.filename,amount:purchase.finalAmount,type:'bankTransfer'}
    purchase.status='inProcess';
    purchase.save();
    return res.json({
      purchase,
      file1: req.files['file1']?.[0]?.filename,
      file2: req.files['file2']?.[0]?.filename
    });
  } catch (error) {
    return res.json({error:error.message})
  }

}


  function extractPaymentDetails(captureData) {
    const captureDetails = captureData.purchase_units[0]?.payments?.captures[0];
  
    if (!captureDetails || !captureDetails.status || captureDetails.status !== 'COMPLETED') {
        throw new Error('Payment capture failed or was not completed. If you see any funds on hold on your account statement, these should be released shortly. If they persist, please contact your bank.');
    }
    console.log(captureDetails)
    const paymentDetails = {
      paypalId:captureDetails.id,
      amount: captureDetails.amount.value,
      currency: captureDetails.amount.currency_code,
      fee: captureDetails.seller_receivable_breakdown.paypal_fee.value,
      netAmount: captureDetails.seller_receivable_breakdown.net_amount.value,
      receivableAmount: captureDetails.seller_receivable_breakdown.receivable_amount.value,
      receivableCurrency: captureDetails.seller_receivable_breakdown.receivable_amount.currency_code,
      exchangeRate: captureDetails.seller_receivable_breakdown.exchange_rate.value,
      type:'paypal'
    };
  
    return paymentDetails;
  }
  
module.exports={createOrder,capturePayment,paymentByTransfer,multerUpload}
