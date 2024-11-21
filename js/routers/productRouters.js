const {Router}=require('express');
const { getProducts, createProduct, getProductsByCodes, getCategories, checkCupon, createCupon, productImage } = require('../controllers/productPost');
const ProductRouter=Router()
require('dotenv').config()

ProductRouter.post('/products',getProducts);
ProductRouter.post('/products/bycodes',getProductsByCodes);
ProductRouter.post('/product/new',createProduct);
ProductRouter.post('/categories',getCategories);
ProductRouter.post('/cupon',checkCupon);
ProductRouter.post('/cupon/create',createCupon);
ProductRouter.get('/products/image',productImage);


module.exports=ProductRouter;