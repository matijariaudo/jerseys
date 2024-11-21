const {Router}=require('express');
const { purchaseCreate } = require('../controllers/purchasePost');
const PurchaseRouter=Router()
require('dotenv').config()

PurchaseRouter.post('/purchase/create',purchaseCreate);


module.exports=PurchaseRouter;