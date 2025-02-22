const isAdmin = (req, res, next) => {
    if(req.user.role == "admin"){
        next();
    }else{
        res.redirect("/");
    }
}

module.exports = isAdmin;