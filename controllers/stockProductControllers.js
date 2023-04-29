const StockProduct = require('../model/stockProductModel')
const BusinessProfile = require('../model/businessProfileModel')
const factory = require('./handleFactory')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const multer = require('multer')
const sharp = require('sharp')

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
  if(file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new AppError(`Not an Image! Please upload only images`, 404), false)
  }
}

const upload = multer({ 
  storage: multerStorage,
  fileFilter: multerFilter
})

exports.uploadstockProductPhoto = upload.single('image')

exports.resizestockProductPhoto = catchAsync(async (req, res, next) => {
  if(!req.file) return next()

  req.file.filename = `stockProduct-${req.user.id}-${req.params.id}-${Date.now()}.png`

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('png')
    .png({ quality: 90 })
    .toFile(`public/img/stockProduct/${req.file.filename}`)

  req.body.image = req.file.filename

  next()
})

// exports.getTotal = catchAsync(async (req, res, next) => {
//   const productId = req.params.id
//   const userId = req.user.id
//   console.log(productId)
//   let stockProduct = await StockProduct.findById(productId)
//   console.log(stockProduct)
//   stockProduct.orderQuantity += 1

//   res.status(200).json({
//     status: 'success',
//     data: {
//       data: stockProduct
//     }
//   })

// })

exports.setBusinessId = (req, res, next) => {
  if(!req.body.businessProfile) req.body.businessProfile = req.params.businessId
  next()
}

exports.check = catchAsync(async (req, res, next) => {
  const response = await BusinessProfile.findById(req.body.businessProfile)

  if(!response) {
    return next(new AppError(`Can't find the document with that Id`, 404))
  }
  
  if(
      !response.location?.coordinates || 
      !response.shippingCost ||
      response.shippingTime?.length === 0 ||
      !response.shippingRadius
    ) {
    return next(new AppError(`Please complete your Business profile before you procced`, 404))
  }

  next()
})


exports.getSingleStockProduct = catchAsync(async (req, res, next) => {
  let query = StockProduct.findById(req.params.id);
  const doc = await query;

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  if(doc.unit === 'lb') {
    if(req.query.unit === 'kg') {
      doc.unit = 'kg'
      doc.stock = doc.stock * 0.45359237
      doc.price = doc.price * 0.45359237
    }
  
    if(req.query.unit === 'oz') {
      doc.unit = 'oz'
      doc.stock = doc.stock * 15.9999995
      doc.price = doc.price * 15.9999995
    }
  }

  if(doc.unit === 'kg') {
    if(req.query.unit === 'lb') {
      doc.unit = 'lb'
      doc.stock = doc.stock * 2.20462262
      doc.price = doc.price * 2.20462262
    }
  
    if(req.query.unit === 'oz') {
      doc.unit = 'oz'
      doc.stock = doc.stock * 35.2739619
      doc.price = doc.price * 35.2739619
    }
  }

  if(doc.unit === 'oz') {
    if(req.query.unit === 'lb') {
      doc.unit = 'lb'
      doc.stock = doc.stock * 0.0625
      doc.price = doc.price * 0.0625
    }
  
    if(req.query.unit === 'kg') {
      doc.unit = 'kg'
      doc.stock = doc.stock * 0.0283495231
      doc.price = doc.price * 0.0283495231
    }
  }


  res.status(200).json({
    status: 'success',
    data: {
      data: doc
    }
  });
})


exports.createStockProduct = catchAsync(async (req, res, next) => {

  const response = await BusinessProfile.findById(req.body.businessProfile)

  if(req.user.id !== response.user.id) {
    return next(new AppError(`You don't have permission to create stock product in this account`, 404))
  }

  const doc = await StockProduct.create(
    {
      ...req.body,
      // ...req.file,
      producer: req.user.id
    }
  )

  res.status(201).json({
    status: 'success',
    data: {
      data: doc
    }
  })
})

exports.getAllStockProducts = factory.getAll(StockProduct)
// exports.getSingleStockProduct = factory.getOne(StockProduct)
exports.updateStockProduct = factory.updateOne(StockProduct)
exports.deleteStockProduct = factory.deleteOne(StockProduct)
