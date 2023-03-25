const ReviewProduct = require('../model/reviewProductModel')
const factory = require('./handleFactory')

exports.setProductUserIds = (req, res, next) => {
  // Allow nested routes
  // if(!req.body.farm)  req.body.farm = req.params.farmId
  if(!req.body.product) req.body.product = req.params.productId
  if(!req.body.user) req.body.user = req.user.id
  next();
};

exports.getAllProductReviews = factory.getAll(ReviewProduct)
exports.getProductReview = factory.getOne(ReviewProduct)
exports.createProductReview = factory.createOne(ReviewProduct)
exports.updateProductReview = factory.updateOne(ReviewProduct)
exports.deleteProductReview = factory.deleteOne(ReviewProduct)
