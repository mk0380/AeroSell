const express=require('express')
const user_route=express()

const bodyParser=require('body-parser')
user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({extended:true}))

const env=require('dotenv')
env.config();

const session=require('express-session')
user_route.use(session({secret: `${process.env.SESSION_SECRET}`}))

const userController=require('../controllers/user')

const user=require('../middleware/user')

user_route.set('view engine','ejs')
user_route.set('views','./views/users')

user_route.use(express.static('public'))

const multer=require('multer')
const path=require('path')
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname, '../public/user'))
    },
    filename:function(req,file,cb){
        const name=Date.now()+'-'+file.originalname
        cb(null,name)
    }
})
const upload=multer({storage:storage})

user_route.get('/register',user.isLogout,userController.loadRegister)
user_route.post('/register',upload.single('image'),userController.insertUser)
user_route.get('/verify',userController.verifyMail)
user_route.get('/login',user.isLogout,userController.loginLoad)
user_route.post('/login',userController.verifyLogin)
user_route.get('/home',user.isLogin,userController.loadHome)
user_route.get('/logout',user.isLogin,userController.userLogout)
user_route.get('/forget',user.isLogout,userController.forgetLoad)
user_route.post('/forget',userController.forgetVerify)
user_route.get('/forget-password',user.isLogout,userController.forgetPasswordLoad)
user_route.post('/forget-password',userController.resetPassword)
user_route.get('/verification',userController.verificationLoad)
user_route.post('/verification',userController.sendVerification)
user_route.get('/edit',user.isUser,user.isLogin,userController.editLoad)
user_route.post('/edit',upload.single('image'),userController.updateProfile)

module.exports=user_route