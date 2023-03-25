const Produce = require('../model/produceModel')
const factory = require('./handleFactory')

exports.setFarmUserIds = (req, res, next) => {
  // Allow nested routes
  if(!req.body.farm)  req.body.farm = req.params.farmId
  if(!req.body.user) req.body.user = req.user.id
  next();
};

exports.createProduce = factory.createOne(Produce)
exports.getAllProduces = factory.getAll(Produce)
exports.getProduce = factory.getOne(Produce, { path: 'ProduceReviews' })
exports.updateProduce = factory.updateOne(Produce)
exports.deleteProduce = factory.deleteOne(Produce)
