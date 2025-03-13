const {Schema,model} = require('mongoose');
const mongoose = require('mongoose');

const paymentSchema=Schema({
    paypalId:{type:String,default:'-'},
    amount:{type:Number},
    currency:{type:String,default:"ARS"},
    fee:{type:Number,default:0},
    netAmount:{type:Number},
    document:{type:String},
    verified:{type:Boolean, default:false},
    type:{type:String,enum:['paypal','mercadoPago','bankTransfer']}
})

const purchaseSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        size: {type:String, required:true}
    }],
    name:{type:String,require:true},
    surname:{type:String,require:true},
    email:{type:String,require:true},
    phone:{type:String},
    address:{type:String},
    state:{type:String},
    city:{type:String},
    country:{type:String},
    countryCode:{type:String},
    postCode:{type:String},
    code:{type:String,default:"-"},
    discount:{type:Number},
    finalAmount:{type:Number},
    totalAmount: { type: Number, required: true , default: 1000},
    status: { type: String, default: 'created', enum: ['created','cancelled','inProcess', 'completed', 'cancelled'] },
    purchaseDate: { type: Date, default: Date.now },
    payment:paymentSchema,
    notes:[{type:String}]
}, { timestamps: true });

//quita el password de la rta
purchaseSchema.methods.toJSON= function(){
    const {__v,_id,... product}=this.toObject();
    product.id=_id;
    return product;
}

module.exports=model('Purchase',purchaseSchema)