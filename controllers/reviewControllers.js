const Review = require('../model/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handleFactory')
const AppError = require('../utils/appError')

exports.setFarmUserIds = (req, res, next) => {
  // Allow nested routes
  if(!req.body.businessProfile)  req.body.businessProfile = req.params.farmId
  if(!req.body.user) req.body.user = req.user.id
  next();
};

exports.getReviewForFarm = catchAsync(async (req, res, next) => {

  const doc = await Review.find({businessProfile: req.params.farmId})

  if(!doc) {
    return next(new AppError(`Farm does not exists`, 404))
  }

  res.status(201).json({
    status: 'success',
    data: {
      data: doc
    }
  });
})

// exports.createReview = catchAsync(async (req, res, next) => {

//   // const review = await Review.findOne({user: req.user.id})
//   // const review = await Review.find({businessProfile: req.params.farmId})
//   // console.log(review[review.length-1])

//   // console.log(JSON.stringify(review.user._id) === JSON.stringify(req.user.id))
//   // console.log(JSON.stringify(review.user._id))
//   // console.log(JSON.stringify(req.user.id))
//   // console.log(JSON.stringify(review.businessProfile) === JSON.stringify(req.params.farmId))
//   // console.log(JSON.stringify(review.businessProfile))
//   // console.log(JSON.stringify(req.params.farmId))

//   // if(
//   //   review && 
//   //   JSON.stringify(review.businessProfile) === JSON.stringify(req.params.farmId) && 
//   //   (JSON.stringify(review.user._id) === JSON.stringify(req.user.id))
//   // ) {
//   //   return next(new AppError(`Your review has already submitted for this farm`, 401))
//   // }

//   const doc = await Review.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       data: doc
//     }
//   });
// })

exports.getAllReviews = factory.getAll(Review)
exports.getReview = factory.getOne(Review)
exports.createReview = factory.createOne(Review)
exports.updateReview = factory.updateOne(Review)
exports.deleteReview = factory.deleteOne(Review)
