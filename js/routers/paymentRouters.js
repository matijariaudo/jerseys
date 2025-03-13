const {Router}=require('express');
const { createOrder, capturePayment, paymentByTransfer, multerUpload } = require('../controllers/paymentPost');
const PaymentRouter=Router()
require('dotenv').config()

PaymentRouter.post('/payment/createorder',createOrder);
PaymentRouter.post('/payment/captureorder',capturePayment);
PaymentRouter.post('/payment/upload',multerUpload,(req,res,next)=>{console.log("1aaa");next();},paymentByTransfer)


module.exports=PaymentRouter;