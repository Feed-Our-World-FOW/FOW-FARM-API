const Review = require('../model/reviewModel')
const factory = require('./handleFactory')

exports.setFarmUserIds = (req, res, next) => {
  // Allow nested routes
  if(!req.body.farm)  req.body.farm = req.params.farmId
  if(!req.body.user) req.body.user = req.user.id
  next();
};

exports.getAllReviews = factory.getAll(Review)
exports.getReview = factory.getOne(Review)
exports.createReview = factory.createOne(Review)
exports.updateReview = factory.updateOne(Review)
exports.deleteReview = factory.deleteOne(Review)
