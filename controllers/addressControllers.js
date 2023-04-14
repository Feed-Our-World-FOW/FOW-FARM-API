const Address = require('../model/addressModel')
const factory = require('./handleFactory')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.setUserUserId = (req, res, next) => {
  if(!req.body.user) req.body.user = req.user.id
  next()
}

exports.getAllAddress = factory.getAll(Address)
exports.getSingleAddress = factory.getOne(Address)
// exports.createAddress = factory.createOne(Address)
exports.updateAddress = factory.updateOne(Address)
exports.deleteAddress = factory.deleteOne(Address)


exports.createAddress = catchAsync(async (req, res, next) => {
  let myAddress = await Address.find({ user: req.user.id })

  if(myAddress.length > 0) {
    return next(new AppError(`You already have an address, please delete the existing one before create a new one`, 400))
  }

  const doc = await Address.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      data: doc
    }
  });
});


exports.getMyAddress = catchAsync(async (req, res, next) => {
  let query = Address.find({ user: req.user.id })
  const doc = await query

  res.status(200).json({
    status: 'success',
    data: {
      data: doc
    }
  })
})

exports.updateMyAddress = catchAsync(async (req, res, next) => {
  let query = Address.find({ user: req.user.id })
  const address = await query
  const id = address[0]._id

  const doc = await Address.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  })

  if (!doc) {
    return next(new AppError(`You don't have any Address saved`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: doc
    }
  });
})
