const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/WrapAsync");
const {listingSchema,reviewSchema}=require("../schema");
const ExpressError=require("../utils/ExpressError");
const Listing=require("../models/listing");
const Review=require("../models/review");
const {validatereview,isAuthor,isLoggedin}=require("../middleware");

//post route
router.post("/",isLoggedin,validatereview,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    let newReview=new Review({...req.body.review});
    newReview.author=req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","review is added");
    console.log("review saved");
    res.redirect(`/listings/${listing._id}`);
}));

//delete route
router.delete("/:reviewid",isLoggedin,isAuthor,async(req,res)=>{
    let {id,reviewid}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{ reviews : reviewid}});
    await Review.findByIdAndDelete(reviewid);
    req.flash("success","your review is deleted");
    res.redirect(`/listings/${id}`);
})
module.exports=router;
