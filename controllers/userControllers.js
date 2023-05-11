const multer = require('multer')
const sharp = require('sharp')
const User = require('../model/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./handleFactory')
const {uploadImage} = require('../utils/helpers')


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

exports.uploadUserPhoto = upload.single('photo')

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if(!req.file) return next()
  console.log(req.file)

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
  req.body.photo = await uploadImage(req.file)
  // console.log(req.file)
  // console.log(req.body)
  next()
})

const filterObj = (obj, ...allowFields) => {
  const newObj = {}
  Object.keys(obj).forEach(el => {
    if(allowFields.includes(el)) newObj[el] = obj[el]
  })
  return newObj
}

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id
  next()
}

exports.updateMe = catchAsync(async (req, res, next) => {

  // 1) Create error if user POSTs password data
  if(req.body.password || req.body.passwordConfirm) {
    return next(new AppError(`This route is not for password update, Please use /updateMyPAssword.`, 400))
  }

  // const filteredBody = filterObj(req.body, 'name', 'email')
  // if(req.file) filteredBody.photo = req.file.filename

  // 2) Update user's document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true, 
    runValidators: true
  })

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  })
})

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false })

  res.status(204).json({
    status: 'success',
    data: null
  })
})

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead'
  })
}

exports.getSingleUser = factory.getOne(User);
exports.getAllUser = factory.getAll(User);

// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

