require('dotenv').config()
const axios = require('axios');
const { Purchase } = require('../models');


const PAYPAL_API = process.env.ISPRODUCTION!="false"?`https://api-m.paypal.com`:'https://api-m.sandbox.paypal.com';
const CLIENT_ID= process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET= process.env.PAYPAL_SECRET;
console.log("PAYPAL",CLIENT_ID,CLIENT_SECRET,PAYPAL_API)
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
    const purchase=await Purchase.findById(purchaseId)
    if(!purchase){
    //    return res.status(500).send('Error capturing order: No Order Id');
    }
    if(purchase.payment){
    //    return res.status(500).send('Error capturing order: Order finished');
    }
    try {
      const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {}, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
        }
      });
      const payment=extractPaymentDetails(response.data);
      purchase.payment=payment;
      await purchase.save()
      res.json({status: "OK"}); // Devuelve los detalles de la transacción
    } catch (err) {
      res.status(500).send({message:'Error capturing order',error:err.message});
    }
  }


  function extractPaymentDetails(captureData) {
    const captureDetails = captureData.purchase_units[0]?.payments?.captures[0];
  
    if (!captureDetails || !captureDetails.status || captureDetails.status !== 'COMPLETED') {
        throw new Error('Payment capture failed or was not completed. If you see any funds on hold on your account statement, these should be released shortly. If they persist, please contact your bank.');
    }
    
    const paymentDetails = {
      amount: captureDetails.amount.value,
      currency: captureDetails.amount.currency_code,
      paypalFee: captureDetails.seller_receivable_breakdown.paypal_fee.value,
      netAmount: captureDetails.seller_receivable_breakdown.net_amount.value,
      receivableAmount: captureDetails.seller_receivable_breakdown.receivable_amount.value,
      receivableCurrency: captureDetails.seller_receivable_breakdown.receivable_amount.currency_code,
      exchangeRate: captureDetails.seller_receivable_breakdown.exchange_rate.value,
    };
  
    return paymentDetails;
  }
  
module.exports={createOrder,capturePayment}
