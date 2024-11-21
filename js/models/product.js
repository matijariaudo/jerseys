const {Schema,model} = require('mongoose');

const imagesSchema=Schema({
     link:String,
     isMain:Number,
     status: {type:Boolean,default:true}
})



const productSchema=Schema({
    product:{
        type:String,
        default:"-",
        require:[true,"El nombre es obligatorio."]
    },
    code:{
        type:String,
        require:[true,"El correo electrónico es obligatorio"],
        unique:true
    },
    price:{
        type:Number
    },
    year:{
        type:Number
    },
    sport:{
        type:String,
        require:true,
        emun:['Basketball','Soccer']
    },
    category:{
        type:String,
        default:"Others",
        require:true
    },
    team:{
        type:String
    },
    mainImg:{
        type:String
    },
    images: [imagesSchema],
    categoryFilter:{
        type:String,
        default:"Others",
        require:true
    },
    teamFilter:{
        type:String
    },
    details:{
        type:String
    },
    importance:{
        type:Number,
        default:0
    },
    estado:{
        type:Boolean,
        default:true
    }
});

//quita el password de la rta
productSchema.methods.toJSON= function(){
    const {__v,_id,... product}=this.toObject();
    product.id=_id;
    return product;
}

module.exports=model('Product',productSchema)

