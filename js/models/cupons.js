const {Schema,model} = require('mongoose');




const cuponsSchema=Schema({
    code:{
        type:String,
        default:"-",
        require:[true,"El nombre es obligatorio."]
    },
    amount:{
        type:Number
    },
    status:{
        type:Boolean,
        default:true
    }
});

//quita el password de la rta
cuponsSchema.methods.toJSON= function(){
    const {__v,_id,... product}=this.toObject();
    product.uid=_id;
    return product;
}

module.exports=model('Cupon',cuponsSchema)

