const Address = require('../model/addressModel')
const factory = require('./handleFactory')

exports.setUserUserId = (req, res, next) => {
  if(!req.body.user) req.body.user = req.user.id
  next()
}

exports.getAllAddress = factory.getAll(Address)
exports.getSingleAddress = factory.getOne(Address)
exports.createAddress = factory.createOne(Address)
exports.updateAddress = factory.updateOne(Address)
exports.deleteAddress = factory.deleteOne(Address)

