if(process.env.NODE_ENV !="production"){
require('dotenv').config()
}
const MongoStore = require('connect-mongo');
const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodoverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError");
const listingRoute=require("./routes/listing");
const reviewRoute=require("./routes/review");
const userRoute=require("./routes/user");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const localstrategy=require("passport-local");
const User=require("./models/user");
app.use(methodoverride("_method"));
app.use(flash());
const mongo_url=process.env.ATLASDB_URL;
const store=MongoStore.create({
    mongoUrl:"mongodb://127.0.0.1:27017/taskmanager",
    crypto:{
        secret:"mysecret"
    },
    touchAfter:24*3600,
})
store.on("error",()=>{
    console.log("session store error",err)
})
const sessionoptions={
    store:store,
    secret:"mysecret",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+1000*60*60*24*3,
        maxAge:1000*60*60*24*3,
        httpOnly:true,
    }
};

app.use(session(sessionoptions));

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));

app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"public")))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localstrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.curruser=req.user;
    next();
})


app.use("/listings",listingRoute);
app.use("/listings/:id/reviews",reviewRoute);
app.use("/",userRoute);
//root
app.get("/",(req,res)=>{
    res.send("this is Home");
})





app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"page not found!"));
})
app.use((err,req,res,next)=>{
    let {statusCode=500,message="something went wrong!"}=err;
    res.status(statusCode).render("error.ejs",{message});
})
app.listen(8080,()=>{
    console.log("server is listening!");
});