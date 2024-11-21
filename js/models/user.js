const {Schema,model} = require('mongoose');
const { generarCodigoAleatorio } = require('../helpers/aleatoryGen');


const apiSchema=Schema({
    name:{type:String,require:[true,'You must define a name']},
    password:{type:String,default:generarCodigoAleatorio(25)},
    status:{type:String,default:'active',enum:['active','deleted','paused']}
})

const userSchema=Schema({
    name:{
        type:String,
        default:"-",
        require:[true,"El nombre es obligatorio."]
    },
    email:{
        type:String,
        require:[true,"El correo electrónico es obligatorio"],
        unique:true
    },
    email_valid:{
        type:Boolean,
        default:false
    },
    password:{
        type:String,
        default:"-",
        require:[true,"La clave es obligatoria"],
    },
    phone:{
        type:String
    },
    rol:{
        type:String,
        default:"USER_ROLE",
        require:true,
        emun:['USER_ROLE','SELLER_ROLE','ADMIN_ROLE']
    },
    google:{
        type:Boolean,
        default:false
    },
    estado:{
        type:Boolean,
        default:true
    }
});

//quita el password de la rta
userSchema.methods.toJSON= function(){
    const {__v,password,_id,apiPass,... user}=this.toObject();
    user.uid=_id;
    user.password=password!="-"?true:false;
    return user;
}

module.exports=model('User',userSchema)

