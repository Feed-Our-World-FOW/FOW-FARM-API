const BusinessProfile = require('../model/businessProfileModel')
const factory = require('./handleFactory')
const catchAsync = require('../utils/catchAsync')

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
// exports.getSingleProfile = factory.getOne(BusinessProfile, { path: 'address reviews' })
exports.getSingleProfile = factory.getOne(BusinessProfile, { path: 'reviews' })
exports.updateProfile = factory.updateOne(BusinessProfile)
exports.deleteProfile = factory.deleteOne(BusinessProfile)
