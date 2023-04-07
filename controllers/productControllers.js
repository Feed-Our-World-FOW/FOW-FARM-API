const Product = require('../model/productModel')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handleFactory')
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

exports.uploadProductImages = upload.array('image', 5)

exports.resizeProductImages = catchAsync(async(req, res, next) => {
  if(!req.files) return next()

  console.log(req.files[0].buffer)
  
  req.body.image = []

  await Promise.all(req.files.map(async(file, i) => {
    const filename = `products-${req?.params?.id || req?.body?.farm}-${req.user._id}-${Date.now()}-${i + 1}.jpeg`

    await sharp(file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 99 })
      .toFile(`public/img/products/${filename}`)

   req.body.image.push(filename) 

  }))
  
  next()
})

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
