const User = require('../models/user')

const loadHome = async (req, res) => {
    try {
        if(req.session.user_id){
            const userData=await User.findOne({_id:req.session.user_id})
            return res.render('homepage',{user : userData})
        }
        res.render('homepage',{user:""})
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = { loadHome }