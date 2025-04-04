
const { jsonAnswer } = require('../helpers/apiFormat');
const { Purchase, User, Product, Cupon } = require('../models');
require('dotenv').config()

const purchaseCreate=async(req,res)=>{
    const { userId, name, surname,email, phone, address, city, state, country,countryCode, postCode, products, code, purchaseId } = req.body;
    try {
        // Buscar la compra si existe
        let purchase = await Purchase.findById(purchaseId);

        let totalAmount = 0;
        for (let i = 0; i < products.length; i++) {
            const { productId } = products[i];
            const product = await Product.findById(productId);
            products[i].price = product.price;
            totalAmount += products[i].quantity*product.price;
            console.log(product.price); 
        }

        let finalAmount = totalAmount;
        let discount = 0;
        if (code) {
            const cupon = await Cupon.findOne({ code });
            if (cupon) {
                discount = cupon.amount;
                finalAmount = discount <= 1 ? (finalAmount * discount) : (finalAmount - discount);
            }
        }

        // Si la compra existe, actualiza los datos
        if (purchase) {
            purchase = await Purchase.findByIdAndUpdate(
                purchaseId, 
                {
                    userId,
                    name,
                    surname,
                    email,
                    phone,
                    address,
                    city,
                    state,
                    country,
                    countryCode,
                    postCode,
                    products,
                    totalAmount,
                    code,
                    discount,
                    finalAmount
                },
                { new: true } // Esto garantiza que devuelvas la compra actualizada
            );
            return res.status(200).json(await jsonAnswer(200, null, 'The purchase has been updated', { purchase }));
        }

        // Si no existe, crea una nueva compra
        const newPurchase = new Purchase({
            userId,
            name,
            surname,
            email,
            phone,
            address,
            city,
            state,
            country,
            countryCode,
            postCode,
            products,
            totalAmount,
            code,
            discount,
            finalAmount
        });

        await newPurchase.save();
        return res.status(200).json(await jsonAnswer(200, null, 'The purchase has been created', { purchase: newPurchase }));

    }  catch (error) {
        console.log(error)
        return res.status(200).json(await jsonAnswer(400,"The operation has failed","Your chat has not correctly found.",null));
    }
}

const purchaseChangeStatus=async (req,res)=>{
    try {
        const {purchaseId,newStatus}=req.body;
        const purchase=await Purchase.findById(purchaseId);
        purchase.status=newStatus;
        purchase.save();
        return res.status(200).json(await jsonAnswer(200,'The purchase status has been changed',{purchase}));
    } catch (error) {
        return res.status(400).json(await jsonAnswer(400,"The operation has failed","Your chat has not correctly found.",{error:error.message}));
    }
}



module.exports={
    purchaseCreate,
    purchaseChangeStatus
}