const ReviewProduce = require('../model/reviewProduceModel')
const factory = require('./handleFactory')

exports.setFarmUserIds = (req, res, next) => {
  // Allow nested routes
  if(!req.body.farm)  req.body.farm = req.params.farmId
  if(!req.body.user) req.body.user = req.user.id
  next();
};

exports.getAllProduceReviews = factory.getAll(ReviewProduce)
exports.getProduceReview = factory.getOne(ReviewProduce)
exports.createProduceReview = factory.createOne(ReviewProduce)
exports.updateProduceReview = factory.updateOne(ReviewProduce)
exports.deleteProduceReview = factory.deleteOne(ReviewProduce)
