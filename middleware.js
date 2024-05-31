const Listing=require("./models/listing");
const Review=require("./models/review");
const {listingSchema}=require("./schema");
const {reviewSchema}=require("./schema");
const ExpressError = require("./utils/ExpressError");
module.exports.isLoggedin=(req,res,next)=>{
    if(!req.isAuthenticated())
    {
        req.session.redirecturl=req.originalUrl;
        req.flash("error","you must be logged in");
        return res.redirect("/login");
    }
    return next();
}


module.exports.saveRedirecturl=(req,res,next)=>{
    if(req.session.redirecturl){
        res.locals.redirecturl=req.session.redirecturl;
    }
    next();
}

module.exports.isOwner=async(req,res,next)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    if(!listing.owner.equals(res.locals.curruser._id))
    {
        req.flash("error","You are not the owner");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validatelisting=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error)
    {
        throw new ExpressError(404,"validation failed");
    }
    return next();
}

module.exports.validatereview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error)
    {
        throw new ExpressError(400,"error");
    }
    next();
}

module.exports.isAuthor=async(req,res,next)=>{
    let {id,reviewid}=req.params;
    let review= await Review.findById(reviewid);
    //console.log(review);
    if(!review.author.equals(req.user._id))
    {
        req.flash("error","You are not the Author of the review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}