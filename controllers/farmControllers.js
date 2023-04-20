const Farm = require('../model/farmModel')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handleFactory')
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

exports.uploadFarmImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 1 }
])

exports.resizeFarmImages = catchAsync( async(req, res, next) => {
  if(!req?.files?.imageCover || !req.files.images) return next()

  // console.log(req.files)

  const coverImage = `farm-${req.params.id}-${Date.now()}-cover.jpeg`
  req.body.imageCover = coverImage
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/farms/${coverImage}`)

  const image = `farm-${req.params.id}-${Date.now()}-image.jpeg`
  req.body.images = image
  await sharp(req.files.images[0].buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/farms/${image}`)
  
  next()
})

exports.aliasTopFarm = (req, res, next) => {
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage'
  req.query.fields = 'name,ratingsAverage,images,summary,imageCover'
  next()
}

exports.getAllFarm = factory.getAll(Farm)
// exports.getSingleFarm = factory.getOne(Farm, { path: 'reviews allMeats allProduce allProduct' })
exports.getSingleFarm = factory.getOne(Farm, { path: 'reviews allProduct' })
exports.updateFarm = factory.updateOne(Farm)
exports.deleteFarm = factory.deleteOne(Farm)

exports.createFarm = catchAsync(async (req, res, next) => {
  const doc = await Farm.create({ ...req.body, owner: req.user.id });

  res.status(201).json({
    status: 'success',
    data: {
      data: doc
    }
  });
});


exports.updateFarm = catchAsync(async (req, res, next) => {

  const doc = await Farm.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  const farm = await Farm.findById(req.params.id)

  // console.log(JSON.stringify(req.user.id))
  // console.log(JSON.stringify(farm.owner))

  if(JSON.stringify(req.user.id) !== JSON.stringify(farm.owner._id)) 
  return next(new AppError(`You don't have permission to edit these Farm properties`, 400))


  res.status(200).json({
    status: 'success',
    data: {
      data: doc
    }
  });
});



exports.getFarmStats = catchAsync(async (req, res) => {
  const stats = await Farm.aggregate([
    {
      $match: { ratingsAverage: { $gte: 3.5 } }
    },
    {
      $group: {
        _id: '$ratingsAverage',
        numFarms: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        lowRating: { $min: '$ratingsAverage' },
        highRating: { $max: '$ratingsAverage' },
        avgRating: { $avg: '$ratingsAverage' },
      }
    },
    {
      $sort: { avgRating: 1 }
    }
  ])

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  })
})

exports.getFarmWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params
  const [ lat, lng ] = latlng.split(',')

  const radius = unit === 'ml' ? distance / 3963.2 : distance / 6378.1

  if(!lat || !lng) {
    next(new AppError('please provide latitude and longitude in the format lat, lng', 400))
  }

  const farm = await Farm.find({ 
    location: { 
      $geoWithin: { $centerSphere: [[lng, lat], radius] } } })

  res.status(200).json({
    status: 'success',
    results: farm.length,
    data: {
      data: farm
    }
  })

})

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params
  const [ lat, lng ] = latlng.split(',')

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001

  if(!lat || !lng) {
    next(new AppError('please provide latitude and longitude in the format lat, lng', 400))
  }

  const distances = await Farm.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ])

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  })
})

