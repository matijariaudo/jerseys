
const { jsonAnswer } = require('../helpers/apiFormat');
const { Purchase, User, Product, Cupon } = require('../models');
require('dotenv').config()

const purchaseCreate=async(req,res)=>{
    const {userId,name,email,phone,address,city,state,country,postCode,products,code}=req.body;
    try {
        const user=await User.findById(userId);
        if(!user){return res.status(200).json(await jsonAnswer(400,"The operation has failed","The email is already used.",null));}
        let totalAmount=0;
        for (let i = 0; i < products.length; i++) {
            const {productId}=products[i];
            const product=await Product.findById(productId);
            products[i].price=product.price;
            totalAmount+=product.price;
            console.log(product.price); 
        }
        let finalAmount=totalAmount;let discount=0;
        if(code){
            const cupon=await Cupon.findOne({code});
            if(cupon){
                discount=cupon.amount; 
                finalAmount=discount<=1?(finalAmount*discount):(finalAmount-discount);       
            }
        }
        const newPurchase=new Purchase({userId,name,email,phone,address,city,state,country,postCode,products,totalAmount,code,discount,finalAmount})
        await newPurchase.save()
        return res.status(200).json(await jsonAnswer(200,null,`The user has been created`,{purchase:newPurchase}));
    } catch (error) {
        console.log(error)
        return res.status(200).json(await jsonAnswer(400,"The operation has failed","Your chat has not correctly found.",null));
    }
}

module.exports={
    purchaseCreate
}