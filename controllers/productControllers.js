const Product = require('../model/productModel')
const factory = require('./handleFactory')

exports.setFarmUserIds = (req, res, next) => {
  // Allow nested routes
  if(!req.body.farm)  req.body.farm = req.params.farmId
  if(!req.body.user) req.body.user = req.user.id
  next();
};

exports.createProduct = factory.createOne(Product)
exports.getAllProducts = factory.getAll(Product)
exports.getProduct = factory.getOne(Product, { path: 'productReviews' })
exports.updateProduct = factory.updateOne(Product)
exports.deleteProduct = factory.deleteOne(Product)
