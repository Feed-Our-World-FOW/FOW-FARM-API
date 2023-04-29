const express = require('express')
const router = express.Router({ mergeParams: true})

const {
  createBusinessProfile,
  getAllProfiles,
  getSingleProfile,
  updateProfile,
  deleteProfile,
  getMyProfile
} = require('../controllers/businessProfileControllers')

const {
  protect,
  restrictTo 
} = require('../controllers/authControllers')

const stockProductRouter = require('./stockProductRoutes')

router.use(protect)

router.use('/:businessId/addStockProduct', stockProductRouter)

router.route('/myProfile').get(getMyProfile, getAllProfiles)

router.route('/')
  .post(restrictTo('business'), createBusinessProfile)
  .get(getAllProfiles)

router.route('/:id')
  .get(getSingleProfile)
  .patch(updateProfile)
  .delete(deleteProfile)

module.exports = router
