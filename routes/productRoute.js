const express = require('express')

const {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  setFarmUserIds
} = require('../controllers/productControllers')

const {
  protect,
  restrictTo
} = require('../controllers/authControllers')

const productReviewRouter = require('./reviewProductRoute')

const router = express.Router({ mergeParams: true})

router.use('/:productId/reviewProduct', productReviewRouter)

router.use(protect)

router
  .route('/')
    .get(getAllProducts)
    .post(restrictTo('business'), setFarmUserIds, createProduct)

router
  .route('/:id')
    .delete(restrictTo('business', 'admin'), deleteProduct)
    .get(getProduct)
    .patch(restrictTo('business', 'admin'), updateProduct)

module.exports = router
