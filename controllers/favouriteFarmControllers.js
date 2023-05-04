const FavouriteFarm = require('../model/favouriteFarm')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

exports.addFarm = catchAsync(async (req, res, next) => {
  const userId = req.user.id
  const businessId = req.params.farmId
  let favourite = await FavouriteFarm.findOne({ user: userId })

  if(!favourite) {
    favourite = await FavouriteFarm.create({
      user: userId,
      farms: [{ businessAccount: businessId }]
    })
  } else {
    for(let i = 0; i < favourite.farms.length; i++) {
      if(JSON.stringify(favourite.farms[i].businessAccount) === JSON.stringify(businessId)) {
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
  let favourite = await FavouriteFarm.findOne({ user: userId })

  if(!favourite) {
    return next(new AppError(`You don't have any favourite farms`, 404))
  }

  let itemIndex = favourite.farms.findIndex(p => p.businessAccount == businessId)
  
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
  const favourite = await FavouriteFarm.findOne({ user: userId })

  if(!favourite) {
    return next(new AppError(`You don't have any favourite farms`, 404))
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: favourite
    }
  })
})
