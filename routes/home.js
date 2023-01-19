const express=require('express')
const home_route= express();

const bodyParser=require('body-parser')
home_route.use(bodyParser.json())
home_route.use(bodyParser.urlencoded({extended:true}))

const env=require('dotenv')
env.config();

const session=require('express-session')
home_route.use(session({secret: `${process.env.SESSION_SECRET}`}))

home_route.set('view engine','ejs')
home_route.set('views','./views/home')

home_route.use(express.static('public'))

const home_controller=require('../controllers/home')

home_route.get('/',home_controller.loadHome)

module.exports=home_route

