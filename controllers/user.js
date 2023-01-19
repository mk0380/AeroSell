const User = require('../models/user')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const randomstring=require('randomstring')

const securePassword = async (password) => {
    return await bcrypt.hash(password, 10)
}

// for send mail

const sendVerifyMail = async (name, email, user_id) => {
    try {
        const accessToken= await oAuth2Client.getAccessToken()
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type:'OAuth2',
                user: config.emailUser,
                clientId:config.clientId,
                clientSecret:config.clientSecret,
                refreshToken:config.refreshToken,
                accessToken:config.accessToken
            }
        })
        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: 'For Verification Mail',
            html: '<p>Hii ' + name + ', please click here to <a href="http://127.0.0.1:3000/verify?id=' + user_id + '">  Verify </a> your mail.</p>'
        }
        transporter.sendMail(mailOptions, function (error, info) {

            if (error) {
                console.log(error);
            } else {
                console.log('Email has been sent:- ', info.response);
            }

        })
    } catch (error) {
        console.log(error.message);
    }
}

// for reset password send mail

const sendResetPasswordMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 25,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        })
        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: 'For Reset Password Mail',
            html: '<p>Hii ' + name + ', please click here to <a href="http://127.0.0.1:3000/forget-password?token=' + token + '">  Reset </a> your password.</p>'
        }
        transporter.sendMail(mailOptions, function (error, info) {

            if (error) {
                console.log(error);
            } else {
                console.log('Email has been sent:- ', info.response);
            }

        })
    } catch (error) {
        console.log(error.message);
    }
}

const loadRegister = async (req, res) => {
    try {
        res.render('registration')
    } catch (error) {
        console.log(error.message);
    }
}

const insertUser = async (req, res) => {
    try {

        const check=await User.findOne({email:req.body.email})
        if(check){
           return res.render('registration', { message: "Email already registered."})        
        }

        const user = new User({
            name: req.body.name, email: req.body.email, mobile: req.body.mno,
            image: req.file.filename, password: await securePassword(req.body.password), is_admin: 0
        });

        const userData = await user.save();

        if (userData) {
            sendVerifyMail(req.body.name, req.body.email, userData._id)
            res.render('registration', { message: "Your registration has been successsfully. Please verify your email" })
        } else {
            res.render('registration', { message: "Your registration has failed." })
        }

    } catch (error) {
        res.render('registration', { message: "Your registration has failed." })
    }
}

const verifyMail=async(req,res)=>{
    try {
        const updateInfo=await User.updateOne({_id:req.query.id},{is_verified:1})
        res.render('email-verified')
    } catch (error) {
        console.log(error.message);
    }
}

// login user method started

const loginLoad=async(req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin=async(req,res)=>{
    try {
        const email=req.body.email;
        const password=req.body.password;
        const userData=await User.findOne({email:email})

        if(userData && userData.is_admin===1){
           return res.redirect('/admin/login')
        }

        if(userData){
            const passwordMatch=await bcrypt.compare(password,userData.password)
            if(passwordMatch){
                if(userData.is_verified === 0){
                    res.render('login',{message:'Please verify your email'})
                }else{
                    req.session.user_id=userData._id;
                    res.redirect('/')
                }
            }else{
                res.render('login',{message:'Invalid Credentials'})
            }
        }else{
            res.render('login',{message:'Invalid Credentials'})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadHome=async(req,res)=>{
    try {
        const userData=await User.findById({_id:req.session.user_id})
        res.render('home',{user:userData})
    } catch (error) {
        console.log(error.message);
    }
}

const userLogout=async(req,res,next)=>{
    try {
        req.session.destroy();
        res.redirect('/')
    } catch (error) {
        console.log(error.message);
    }
}

// forget password code start

const forgetLoad=async(req,res)=>{
    try {
        res.render('forget')
    } catch (error) {
        console.log(error.message);
    }
}

const forgetVerify=async(req,res)=>{
    try {
        const email=req.body.email;
        const userData=await User.findOne({email:email})
        if(userData){
            if(userData.is_verified === 0){
                res.render('forget',{message:"Please verify your email"})
            }else{
                const randomString=randomstring.generate();
                const updatedData=await User.updateOne({email:email},{token:randomString})
                sendResetPasswordMail(userData.name,userData.email,randomString)
                res.render('forget',{message:"Please check your email to reset your password"})
            }
        }else{
            res.render('forget',{message:"Invalid Email"})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const forgetPasswordLoad=async(req,res)=>{
    try {
        const token=req.query.token
        const tokenData=await User.findOne({token:token})
        if(tokenData){
            res.render('forget-password',{user_id:tokenData._id})
        }
        else{
            res.render('404',{message:'Token is invalid'})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const resetPassword=async(req,res)=>{
    try {
        const password=req.body.password
        const user_id=req.body.user_id
        const secure_password=await securePassword(password)
        await User.findOneAndUpdate({_id:user_id},{password:secure_password,token:""})
        res.render('password-changed')
    } catch (error) {
        console.log(error.message);
    }
}

// for verification send link

const verificationLoad=async(req,res)=>{
    try {
        res.render('verification')
    } catch (error) {
        console.log(error.message);
    }
}

const sendVerification=async(req,res)=>{
    try {
        const email=req.body.email
        const userData=await User.findOne({email:email})
        if(userData){
            sendVerifyMail(userData.name,userData.email,userData._id)
            res.render('verification',{message:"Please check your email for verification"})
        }
        else{
            res.render('verification',{message:"Email is incorrect"})
        }
    } catch (error) {
        console.log(error.message);
    }
}

// user profile edit and update

const editLoad=async(req,res)=>{
    try {
        const id=req.query.id
        const userData=await User.findById({_id:id})
        if(userData){
            res.render('edit',{user:userData})
        }else{
            res.redirect('/home')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const updateProfile=async(req,res)=>{
    try {
        if(req.file){
            const userData=await User.findByIdAndUpdate({_id:req.body.user_id},{name:req.body.name,mobile:req.body.mno,
            image:req.file.filename})
        }else{
            const userData=await User.findByIdAndUpdate({_id:req.body.user_id},{name:req.body.name,mobile:req.body.mno})
        }
        res.redirect('/home')

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = { loadRegister, insertUser, verifyMail, loginLoad, verifyLogin, loadHome, userLogout, forgetLoad,
                   forgetVerify, forgetPasswordLoad, resetPassword,verificationLoad, sendVerification, editLoad,
                   updateProfile }