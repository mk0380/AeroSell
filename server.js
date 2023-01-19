const express=require('express')
const app= express();

const env=require('dotenv')
env.config();

const bodyParser=require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

app.listen(process.env.PORT , ()=>{
    console.log(`Server is running on PORT : ${process.env.PORT}`);
})

const mongoose=require('mongoose')
// const url=`mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.8xduwqf.mongodb.net/${process.env.MONGO_DB_DATABASE}?retryWrites=true&w=majority`
const urll='mongodb+srv://MayanKumar:Q0WRg76MdCV36peh@cluster0.8xduwqf.mongodb.net/flipkart?retryWrites=true&w=majority'
mongoose.connect(urll).then(()=>{
    console.log("DB connected");
})

const home_route= require('./routes/home')
app.use('/',home_route)

const user_route= require('./routes/user')
app.use('/user',user_route)






