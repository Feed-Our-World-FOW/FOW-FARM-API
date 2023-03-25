const express = require('express')

const {
  createFarm,
  getAllFarm,
  getSingleFarm,
  updateFarm,
  deleteFarm,
  aliasTopFarm,
  getFarmStats,
  getFarmWithin,
  getDistances
} = require('../controllers/farmControllers')


const {
  protect,
  restrictTo
} = require('../controllers/authControllers')

const reviewRouter = require('./reviewRoutes')
const meatRouter = require('./meatRoutes')
const produceRouter = require('./produceRoutes')
const productRouter = require('./productRoute')

const router = express.Router()

router.use('/:farmId/reviews', reviewRouter)
router.use('/:farmId/addMeat', meatRouter)
router.use('/:farmId/addProduce', produceRouter)
router.use('/:farmId/addProduct', productRouter)

router.route('/top-5').get(aliasTopFarm, getAllFarm)

router.route('/farm-stats').get(getFarmStats)

router.route('/farms-within/:distance/center/:latlng/unit/:unit').get(getFarmWithin)

router.route('/distances/:latlng/unit/:unit').get(getDistances)

router
  .route('/')
    .get(getAllFarm)
    .post(protect, restrictTo('admin', 'business'), createFarm)

router
  .route('/:id')
    .get(getSingleFarm)
    .patch(protect, restrictTo('admin', 'business'), updateFarm)
    .delete(protect, restrictTo('admin', 'business'), deleteFarm)



module.exports = router

