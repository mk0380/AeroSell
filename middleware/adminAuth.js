const isLogin=async(req,res,next)=>{
    try {
        if(req.session.user_id){

        }else{
           return res.redirect('/admin/login')
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
}


const isLogout=async(req,res,next)=>{
    try {
        if(req.session.user_id){
          return res.redirect('/admin/home')
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
}

const isUser=async(req,res,next)=>{
    try {
        if(req.session.user_id===req.query.id){
            next();
        }else{
            req.session.destroy();
            res.redirect('/admin/login')
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={isLogin, isLogout, isUser}