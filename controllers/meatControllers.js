const Meat = require('../model/meatModel')
const factory = require('./handleFactory')

exports.setFarmUserIds = (req, res, next) => {
  // Allow nested routes
  if(!req.body.farm)  req.body.farm = req.params.farmId
  if(!req.body.user) req.body.user = req.user.id
  next();
};

exports.createMeat = factory.createOne(Meat)
exports.getAllMeats = factory.getAll(Meat)
exports.getMeat = factory.getOne(Meat, { path: 'meatReviews' })
exports.updateMeat = factory.updateOne(Meat)
exports.deleteMeat = factory.deleteOne(Meat)
