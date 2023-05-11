const ConsumerProfile = require('../model/consumerProfileModel')
const factory = require('./handleFactory')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

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

exports.updateMyConsumerProfile = (catchAsync(async (req, res, next) => {
  const consumer = await ConsumerProfile.findOne({ user: req.user.id })
  const doc = await ConsumerProfile.findByIdAndUpdate(consumer.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: doc
    }
  });
}))

exports.getAllConsumers = factory.getAll(ConsumerProfile)
exports.getSingleConsumer = factory.getOne(ConsumerProfile)
exports.updateConsumer = factory.updateOne(ConsumerProfile)
exports.deleteConsumer = factory.deleteOne(ConsumerProfile)
