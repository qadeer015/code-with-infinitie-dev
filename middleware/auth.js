const auth = (req, res, next) => {
    if(req.user.id == req.params.id || req.user.role == "admin"){
        next();
    }else{
        res.redirect("/");
    }
}

module.exports = auth;