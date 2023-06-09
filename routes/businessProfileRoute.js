const express = require('express')
const router = express.Router({ mergeParams: true})

const {
  createBusinessProfile,
  getAllProfiles,
  getSingleProfile,
  updateProfile,
  deleteProfile,
  getMyProfile,
  getBusinessStats,
  getBusinessWithin,
  getDistances,
  getMyDistances,
  updateMyBusinessProfile,
  getMyDistanceFromFarm
} = require('../controllers/businessProfileControllers')

const {
  protect,
  restrictTo 
} = require('../controllers/authControllers')

const stockProductRouter = require('./stockProductRoutes')

// router.use(protect)

router.route('/farm-stats').get(getBusinessStats)

router.route('/:businessId/addStockProduct', stockProductRouter)

router.route('/farms-within/:distance/center/:latlng/unit/:unit').get(getBusinessWithin)

router.route('/distance/mylocation/unit/:unit').get(protect, restrictTo('user'), getMyDistances)
router.route('/distance/:farmId/unit/:unit').get(protect, restrictTo('user'), getMyDistanceFromFarm)
router.route('/distance/:latlng/unit/:unit').get(getDistances)


router.route('/myProfile').get(protect, getMyProfile, getAllProfiles)
router.route('/myProfile').patch(protect, updateMyBusinessProfile)

router.route('/')
  .post(protect, restrictTo('business'), createBusinessProfile)
  .get(getAllProfiles)

router.use(protect)

router.route('/:id')
  .get(getSingleProfile)
  .patch(updateProfile)
  .delete(deleteProfile)

module.exports = router
