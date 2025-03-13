const {Router}=require('express');
const { purchaseCreate, purchaseChangeStatus } = require('../controllers/purchasePost');
const PurchaseRouter=Router()
require('dotenv').config();

PurchaseRouter.post('/purchase/create',purchaseCreate);
PurchaseRouter.post('/purchase/changestatus',purchaseChangeStatus);


module.exports=PurchaseRouter;