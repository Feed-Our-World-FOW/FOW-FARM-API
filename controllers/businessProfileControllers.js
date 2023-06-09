const BusinessProfile = require('../model/businessProfileModel')
const ConsumerProfile = require('../model/consumerProfileModel')
const factory = require('./handleFactory')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.createBusinessProfile = catchAsync(async (req, res, next) => {
  const doc = await BusinessProfile.create(
    { 
      ...req.body, 
      user: req.user.id
    }
  )

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

exports.getAllProfiles = factory.getAll(BusinessProfile)
exports.getSingleProfile = factory.getOne(BusinessProfile, { path: 'reviews stockProducts ondemandProducts' })
exports.deleteProfile = factory.deleteOne(BusinessProfile)


exports.updateProfile = catchAsync(async (req, res, next) => {
  const business = await BusinessProfile.findById(req.params.id)

  if(JSON.stringify(business.user._id) !== JSON.stringify(req.user.id)) {
    return next(new AppError(`You aren't the owner of this business profile`, 404))
  }

  const doc = await BusinessProfile.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: doc
    }
  });
})

exports.updateMyBusinessProfile = catchAsync(async (req, res, next) => {
  const myProfile = await BusinessProfile.findOne({ user: req.user.id })

  if(!myProfile) {
    return next(new AppError(`You don't have any business profile`, 404))
  }
  
  const id = myProfile.id

  const doc = await BusinessProfile.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  })

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: doc
    }
  });
})


exports.getBusinessStats = catchAsync(async (req, res) => {
  const stats = await BusinessProfile.aggregate([
    {
      $match: { ratingsAverage: { $gte: 0 } }
    },
    {
      $group: {
        _id: '$ratingsAverage',
        numBusiness: { $sum: 1 },
        numRatings: { $sum: 'ratingsQuantity' },
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


exports.getBusinessWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params
  const [ lat, lng ] = latlng.split(',')

  const radius = unit === 'ml' ? distance / 3963.2 : distance / 6378.1

  if(!lat || !lng) {
    next(new AppError('Please provide latitude and longitude in the format lat, lng', 400))
  }

  const business = await BusinessProfile.find({
    location: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] }
    }
  })

  res.status(200).json({
    status: 'success',
    result: business.length,
    data: {
      data: business
    }
  })
})

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params
  const [ lat, lng ] = latlng.split(',')

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001

  if(!lat || !lng) {
    next(new AppError('Please provide latitude and longitude in the format of lat, lng', 400))
  }

  const distance = await BusinessProfile.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
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
      data: distance
    }
  })
})


exports.getMyDistances = catchAsync(async (req, res, next) => {
  const consumerProfile = await ConsumerProfile.findOne({ user: req.user.id })
  
  if(!consumerProfile) {
    return next(new AppError(`No consumer profile exists with that Id`, 404))
  }
  
  if(!consumerProfile.location || !consumerProfile.location.coordinates) {
    return next(new AppError(`Please update your location`, 404))
  }

  const latlng = consumerProfile.location.coordinates
  const lat = latlng[1]
  const lng = latlng[0]

  const { unit } = req.params

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001

  if(!lat || !lng) {
    next(new AppError('Please provide latitude and longitude in the format of lat, lng', 400))
  }

  const distance = await BusinessProfile.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
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
      data: distance
    }
  })
})


function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function calculateDistance(lat1, lon1, lat2, lon2, unit = 'km') {
  const R = unit === 'mi' ? 3963.2 : 6378.1; // Radius of the Earth in miles or kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}


exports.getMyDistanceFromFarm = catchAsync(async (req, res, next) => {
  const consumerProfile = await ConsumerProfile.findOne({ user: req.user.id })
  const businessProfile = await BusinessProfile.findById(req.params.farmId)
  const unit = req.params.unit

  if(!consumerProfile) {
    return next(new AppError(`No consumer profile exists with that Id`, 404))
  }
  
  if(!consumerProfile.location || !consumerProfile.location.coordinates) {
    return next(new AppError(`Please update your location`, 404))
  }

  const latlng = consumerProfile.location.coordinates
  const lat1 = latlng[1]
  const lon1 = latlng[0]

  if(!businessProfile.location || !businessProfile.location.coordinates) {
    return next(new AppError(`This farm doesn't update it's location`, 404))
  }
  
  const latlng2 = businessProfile.location.coordinates
  const lat2 = latlng2[1]
  const lon2 = latlng2[0]
  
  if(!lat1 || !lon1 || !lat2 || !lon2) {
    next(new AppError('Please provide latitude and longitude in the format of lat, lng', 400))
  }

  const dis = calculateDistance(lat1, lon1, lat2, lon2, unit)

  res.status(200).json({
    status: 'success',
    data: {
      data: dis
    }
  })
})
