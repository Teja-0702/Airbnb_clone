const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/WrapAsync");
const {listingSchema,reviewSchema}=require("../schema");
const ExpressError=require("../utils/ExpressError");
const Listing=require("../models/listing");
const {isOwner}=require("../middleware");
const {validatelisting}=require("../middleware");
const {isLoggedin}=require("../middleware");
const multer  = require('multer')
const {storage}=require("../cloudconfig");
const upload = multer({ storage });
//new
router.get("/new",isLoggedin,(req,res)=>{
    res.render("listings/new.ejs");
});

//index
router.get("/",wrapAsync(async(req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));




//show
router.get("/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate({
        path:"reviews",
        populate:{
            path:"author",
        }
    }).populate("owner");
    if(!listing)
    {
        req.flash("error","the listing you requested does not exists");
        return res.redirect("/listings");
    }
    //console.log(listing);
    res.render("listings/show.ejs",{listing});
}));
//create
router.post("/",isLoggedin,upload.single('listing[image]'),validatelisting,wrapAsync(async(req,res)=>{
    console.log(req.file);
    let {listing}=req.body;
    let url=req.file.path;
    let filename=req.file.filename;
    const newlisting=new Listing({...listing});
    newlisting.owner=req.user._id;
    newlisting.image={url,filename};
    await newlisting.save();
    req.flash("success","new listing is successfully created");
    res.redirect("/listings");
}));

//edit
router.get("/:id/edit",isLoggedin,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing)
    {
        req.flash("error","the listing you requested does not exists");
        res.redirect("/listings");
    }
    let originalurl=listing.image.url;
    originalurl=originalurl.replace("/upload","/upload/h_300,w_250");
    console.log("edit request is made");
    res.render("listings/edit.ejs",{listing,originalurl});
}));

//update
router.put("/:id",isLoggedin,isOwner,upload.single('listing[image]'),validatelisting,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    if(typeof req.file !== "undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        let updatedlisting=await Listing.findByIdAndUpdate(id,{...req.body.listing});
        updatedlisting.image={url,filename};
        await updatedlisting.save();
    }else{
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    }
    req.flash("success","the listing is updated");
    res.redirect(`/listings/${id}`);
}));



//destroy
router.delete("/:id",isLoggedin,isOwner,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let deletedlisting=await Listing.findByIdAndDelete(id);
    req.flash("success","the listing is deleted");
    console.log(deletedlisting);
    res.redirect("/listings");
}));
module.exports=router;