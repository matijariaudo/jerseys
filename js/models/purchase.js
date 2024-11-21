const {Schema,model} = require('mongoose');
const mongoose = require('mongoose');

const paymentSchema=Schema({
    amount:{type:Number},
    currency:{type:String},
    paypalFee:{type:Number},
    netAmount:{type:Number}
})

const purchaseSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        size: {type:String, required:true}
    }],
    name:{type:String},
    email:{type:String},
    phone:{type:String},
    address:{type:String},
    state:{type:String},
    city:{type:String},
    country:{type:String},
    postCode:{type:String},
    code:{type:String,default:"-"},
    discount:{type:Number},
    finalAmount:{type:Number},
    totalAmount: { type: Number, required: true , default: 1000},
    status: { type: String, default: 'created', enum: ['created','pending', 'completed', 'canceled'] },
    purchaseDate: { type: Date, default: Date.now },
    payment:paymentSchema
}, { timestamps: true });

//quita el password de la rta
purchaseSchema.methods.toJSON= function(){
    const {__v,_id,... product}=this.toObject();
    product.id=_id;
    return product;
}

module.exports=model('Purchase',purchaseSchema)