const express = require('express');
const router = express.Router({mergeParams:true});

const Review = require('../models/review')
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const {reviewSchema} = require('../schemas');
const {isLoggedIn, validateReview, isReviewAuthor}  = require('../middleware')
const ExpressError = require('../utils/ExpressError');



router.post('/', isLoggedIn,  validateReview, catchAsync(async (req, res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user.id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully made a review!')
    res.redirect(`/campgrounds/${campground.id}`)
}))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async(req,res)=>{
    const {id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { review: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully delete a review!')
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;