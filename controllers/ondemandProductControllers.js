const OndemandProduct = require('../model/ondemandProductModel')
const BusinessProfile = require('../model/businessProfileModel')
const factory = require('./handleFactory')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const multer = require('multer')
const sharp = require('sharp')
const { uploadImage } = require('../utils/helpers')
const convert = require('convert-units')

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
  fileFilter: multerFilter,
  limits: {
    fileSize: 1048576
  }
})

exports.uploadOndemandProductPhoto = upload.single('image')

exports.resizeOndemandProductPhoto = catchAsync(async (req, res, next) => {
  if(!req.file) return next()

  await sharp(req.file.buffer)
    .resize(500, 500)
    .ensureAlpha(0)
    .toFormat('png')
    .png()

  req.body.image = await uploadImage(req.file)

  next()
})

exports.setBusinessId = catchAsync(async (req, res, next) => {
  const userId = req.user.id
  const business = await BusinessProfile.findOne({ user: userId })
  if(!business) {
    return next(new AppError(`Can't find the document with that Id`, 404))
  }
  if(!req.body.businessProfile) req.body.businessProfile = business._id

  next()
})

exports.check = catchAsync(async (req, res, next) => {
  const response = await BusinessProfile.findById(req.body.businessProfile)

  // if(!response) {
  //   return next(new AppError(`Can't find the document with that Id`, 404))
  // }
  
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

exports.getSingleOndemandProduct = catchAsync(async (req, res, next) => {
  let query = OndemandProduct.findById(req.params.id);
  const doc = await query;

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  if(doc.unit === 'lb') {
    if(req.query.unit === 'kg') {
      doc.unit = 'kg'
      doc.capacity = doc.capacity * convert(1).from('lb').to('kg')
      doc.price = doc.price / convert(1).from('lb').to('kg')
    }
  
    if(req.query.unit === 'oz') {
      doc.unit = 'oz'
      doc.capacity = doc.capacity * convert(1).from('lb').to('oz')
      doc.price = doc.price / convert(1).from('lb').to('oz')
    }
  }

  if(doc.unit === 'kg') {
    if(req.query.unit === 'lb') {
      doc.unit = 'lb'
      doc.capacity = doc.capacity * convert(1).from('kg').to('lb')
      doc.price = doc.price / convert(1).from('kg').to('lb')
    }
  
    if(req.query.unit === 'oz') {
      doc.unit = 'oz'
      doc.capacity = doc.capacity * convert(1).from('kg').to('oz')
      doc.price = doc.price / convert(1).from('kg').to('oz')
    }
  }

  if(doc.unit === 'oz') {
    if(req.query.unit === 'lb') {
      doc.unit = 'lb'
      doc.capacity = doc.capacity * convert(1).from('oz').to('lb')
      doc.price = doc.price / convert(1).from('oz').to('lb')
    }
  
    if(req.query.unit === 'kg') {
      doc.unit = 'kg'
      doc.capacity = doc.capacity * convert(1).from('oz').to('kg')
      doc.price = doc.price / convert(1).from('oz').to('kg')
    }
  }


  res.status(200).json({
    status: 'success',
    data: {
      data: doc
    }
  });
})

exports.getMyOndemandProduct = catchAsync(async (req, res, next) => {
  const data = await OndemandProduct.find({ producer: req.user.id })

  if(!data) {
    return next(new AppError(`You don't have any ondemand product listed`, 404))
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      data: data
    }
  })
})

exports.createOndemandProduct = catchAsync(async (req, res, next) => {

  const response = await BusinessProfile.findById(req.body.businessProfile)

  if(req.user.id !== response.user.id) {
    return next(new AppError(`You don't have permission to create on-demand product in this account`, 404))
  }

  const doc = await OndemandProduct.create({
    ...req.body, producer: req.user.id
  })

  res.status(201).json({
    status: 'success',
    data: {
      data: doc
    }
  })

})

exports.getAllOndemandProduct = factory.getAll(OndemandProduct)
exports.updateOndemandProduct = factory.updateOne(OndemandProduct)
exports.deleteOndemandProduct = factory.deleteOne(OndemandProduct)
