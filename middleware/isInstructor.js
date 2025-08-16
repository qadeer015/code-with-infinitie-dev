const isInstructor = (req, res, next) => {
    if(req.user.role == "instructor"){
        next();
    }else{
        res.redirect("/");
    }
}

module.exports = isInstructor;