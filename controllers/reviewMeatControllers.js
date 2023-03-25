const ReviewMeat = require('../model/reviewMeatModel')
const factory = require('./handleFactory')

exports.setFarmUserIds = (req, res, next) => {
  // Allow nested routes
  if(!req.body.farm)  req.body.farm = req.params.farmId
  if(!req.body.user) req.body.user = req.user.id
  next();
};

exports.getAllMeatReviews = factory.getAll(ReviewMeat)
exports.getMeatReview = factory.getOne(ReviewMeat)
exports.createMeatReview = factory.createOne(ReviewMeat)
exports.updateMeatReview = factory.updateOne(ReviewMeat)
exports.deleteMeatReview = factory.deleteOne(ReviewMeat)
