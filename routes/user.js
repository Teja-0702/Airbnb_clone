const express=require("express");
const router=express.Router({mergeParams:true});
const User=require("../models/user");
const wrapAsync=require("../utils/WrapAsync");
const passport=require("passport");
const {saveRedirecturl}=require("../middleware");
router.get("/signup",(req,res)=>{
    res.render("users/signup.ejs");
})

router.post("/signup",async(req,res)=>{
    try{
    let {username,password,email}=req.body;
    let newuser=new User({email,username});
    const registereduser=await User.register(newuser,password);

    req.login(registereduser,(err)=>{
        if(err){
           return  next(err);
        }
        req.flash("success","you are logged in");
    })
    console.log(registereduser);
    req.flash("success","user is registered");
    res.redirect("/listings");}
    catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
});


router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
});

router.post("/login",saveRedirecturl,passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),async(req,res)=>{
    req.flash("success","You are logged in");
    let newredirect=res.locals.redirecturl||"/listings";
    res.redirect(newredirect);
})

router.get("/logout",(req,res)=>{
    req.logout((err)=>{
        if(err){
           return  next(err);
        }
        req.flash("success","ypu are logged out");
        res.redirect("/listings");
    })
})
module.exports=router;