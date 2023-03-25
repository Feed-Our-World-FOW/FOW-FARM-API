const Buscket = require('../model/buscketModel')
const factory = require('./handleFactory')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.setBuscketUserIds = (req, res, next) => {
  // Allow nested routes
  // if(!req.body.farm)  req.body.farm = req.params.farmId
  if(!req.body.user) req.body.user = req.user.id
  next();
};

exports.createBuscket = factory.createOne(Buscket)
exports.getAllBuscket = factory.getAll(Buscket)
exports.getBuscket = factory.getOne(Buscket)
exports.updateBuscket = factory.updateOne(Buscket)
exports.deleteBuscket = factory.deleteOne(Buscket)

exports.getMyBuscket = catchAsync(async (req, res, next) => {
  let query = Buscket.find({ user: req.user.id })
  const doc = await query

  res.status(200).json({
    status: 'success',
    data: {
      data: doc
    }
  })
})

exports.addItemsToBuscket = catchAsync(async (req, res, next) => {
  // const prev = await Buscket.findById(req.params.id)

  const buscket = await Buscket.findOneAndUpdate(
    req.params.id,
    {
      $addToSet: {
        items: {
          product: req.body.product,
          quantity: req.body.quantity
        }
      }
    },
    { new: true }
  )

  console.log(req.params.id)
  console.log(buscket)

  res.status(200).json({
    status: 'success',
    data: {
      data: buscket
    }
  })
})
