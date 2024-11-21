require('dotenv').config();
const passport=require('passport');
const passportGoogle=require('passport-google-oauth20') 
const passportFacebook=require('passport-facebook')
const { User } = require('../models');
var jwt = require('jsonwebtoken');
const { sendEmail } = require('./sendEmail');

const GOOGLE_ID=process.env.GOOGLE_ID||"";
const GOOGLE_SECRET=process.env.GOOGLE_SECRET||"";
const ISPRODUCTION=process.env.ISPRODUCTION;
const GOOGLE_CALLBACK=process.env.GOOGLE_CALLBACK;
const GOOGLE_CALLBACK_LOCAL=process.env.GOOGLE_CALLBACK_LOCAL;
const CALLBACKGOOGLE=ISPRODUCTION?GOOGLE_CALLBACK:GOOGLE_CALLBACK_LOCAL;

const FACE_ID=process.env.FACE_ID||"";
const FACE_SECRET=process.env.FACE_SECRET||"";
const GoogleStrategy = passportGoogle.Strategy;
const FacebookStrategy = passportFacebook.Strategy;


function baseProcess(medio){
    return function (accessToken, refreshToken, profile, done){
        let data={};
        data.name=profile._json.name;
        data.email=profile._json.email;
        data.medio=medio
        data.id=profile._json.id||profile._json.sub;
        done(null,data)
    }
}

const GoogleInstance=new GoogleStrategy(
    {
      clientID: GOOGLE_ID,
      clientSecret: GOOGLE_SECRET,
      callbackURL: CALLBACKGOOGLE,
      scope: [ 'profile','email' ]
    },
    baseProcess("google")
)

const FacebookInstance=  new FacebookStrategy(
    {
        clientID: FACE_ID,
        clientSecret: FACE_SECRET,
        callbackURL: "../login/auth/facebook/redirect",
        profileFields: ['id', 'displayName', 'photos', 'email']
    },
    baseProcess("facebook")
  )


passport.serializeUser((user, done) => {done(null, user);});
passport.deserializeUser((user, done) => {done(null, user);});
passport.use(FacebookInstance);
passport.use(GoogleInstance);

const receiptTokens=(req, res, next) => {
    const medio = req.params.medio;
    const medios = ["facebook","google"];
    if(medios.indexOf(medio)<0){return res.send("No encontrado")}
    passport.authenticate(medio, {failureRedirect: '/login-failed' })(req, res, next);

}

const loginTokensPassport=async(req, res) => {
    const {name,email,medio} = req.user;
    let user;
    console.log(name,email,medio)
    user=await User.findOne({email,status:"active"});
    console.log(user)
    if(!user){
        user=await new User({name,email,clave:"-",rol:"USER_ROLE",google:true,email_valid:true});
        console.log(user)
        console.log("ENVIAR CORREO A : ",email)
        sendEmail({email,subject:"Welcome to WSPPlus :)",typeNro:1})
        await user.save();
    }
    const token=jwt.sign({ uid: user.id }, process.env.SEED,{expiresIn:'12h'})
    return res.redirect(`../../..?name=${name}&email=${email}&id=${user.id}&medio=${medio}&token=${token}`);
};
module.exports={passport,receiptTokens,loginTokensPassport}