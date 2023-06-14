const FavouriteFarm = require('../model/favouriteFarm')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const ConsumerProfile = require('../model/consumerProfileModel')

exports.addFarm = catchAsync(async (req, res, next) => {
  const userId = req.user.id
  const businessId = req.params.farmId
  const consumerProfileId = await ConsumerProfile.findOne({ user: userId })
  let favourite = await FavouriteFarm.findOne({ consumerProfile: consumerProfileId._id })

  if(!favourite) {
    favourite = await FavouriteFarm.create({
      consumerProfile: consumerProfileId._id,
      farms: [{ businessAccount: businessId }]
    })
  } else {
    for(let i = 0; i < favourite.farms.length; i++) {
      if(JSON.stringify(favourite.farms[i].businessAccount._id) === JSON.stringify(businessId)) {
        return next(new AppError(`Farm already exists`, 404))
      }
    }

    favourite.farms.push({ businessAccount: businessId })
    await favourite.save()
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: favourite
    }
  })
})

exports.removeFarm = catchAsync(async (req, res, next) => {
  const userId = req.user.id
  const businessId = req.params.farmId
  const consumerProfileId = await ConsumerProfile.findOne({ user: userId })
  let favourite = await FavouriteFarm.findOne({ consumerProfile: consumerProfileId._id })

  if(!favourite) {
    return next(new AppError(`You don't have any favourite farms`, 404))
  }

  let itemIndex = favourite.farms.findIndex(p => p.businessAccount._id == businessId)
  
  if(itemIndex > -1) {
    favourite.farms.splice(itemIndex, 1)
    await favourite.save()
  } else {
    return next(new AppError(`Farm does not exists in this list`, 400))
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: favourite
    }
  })
})

exports.getMyFavouriteFarms = catchAsync(async (req, res, next) => {
  const userId = req.user.id
  const consumerProfileId = await ConsumerProfile.findOne({ user: userId })
  let favourite = await FavouriteFarm.findOne({ consumerProfile: consumerProfileId._id })

  // if(!favourite) {
  //   return next(new AppError(`You don't have any favourite farms`, 404))
  // }

  res.status(200).json({
    status: 'success',
    data: {
      data: favourite
    }
  })
})
