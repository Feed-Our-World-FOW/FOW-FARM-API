const Farm = require('../model/farmModel')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handleFactory')
const AppError = require('../utils/appError')

exports.aliasTopFarm = (req, res, next) => {
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage'
  req.query.fields = 'name,ratingsAverage,images,summary,imageCover'
  next()
}

exports.getAllFarm = factory.getAll(Farm)
exports.getSingleFarm = factory.getOne(Farm, { path: 'reviews allMeats allProduce allProduct' })
exports.createFarm = factory.createOne(Farm)
exports.updateFarm = factory.updateOne(Farm)
exports.deleteFarm = factory.deleteOne(Farm)


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
