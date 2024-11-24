const {Router}=require('express');
const { createOrder, capturePayment } = require('../controllers/paymentPost');
const PaymenteRouter=Router()
require('dotenv').config()

PaymenteRouter.post('/payment/createorder',createOrder);
PaymenteRouter.post('/payment/captureorder',capturePayment);


module.exports=PaymenteRouter;