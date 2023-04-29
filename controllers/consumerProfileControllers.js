const ConsumerProfile = require('../model/consumerProfileModel')
const factory = require('./handleFactory')
const catchAsync = require('../utils/catchAsync')

exports.createConsumerProfile = catchAsync(async (req, res, next) => {
  const doc = await ConsumerProfile.create({
    ...req.body,
    user: req.user.id
  })

  res.status(201).json({
    status: 'success',
    data: {
      data: doc
    }
  })
})

exports.getMyProfile = (req, res, next) => {
  req.query.user = req.user.id
  next()
}

exports.getAllConsumers = factory.getAll(ConsumerProfile)
exports.getSingleConsumer = factory.getOne(ConsumerProfile)
exports.updateConsumer = factory.updateOne(ConsumerProfile)
exports.deleteConsumer = factory.deleteOne(ConsumerProfile)
