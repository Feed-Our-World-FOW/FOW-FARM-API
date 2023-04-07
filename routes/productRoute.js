const express = require('express')

const {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  setFarmUserIds,
  uploadProductImages,
  resizeProductImages
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
    .post(uploadProductImages, resizeProductImages, restrictTo('business', 'admin'), setFarmUserIds, createProduct)

router
  .route('/:id')
    .delete(restrictTo('business', 'admin'), deleteProduct)
    .get(getProduct)
    .patch(uploadProductImages, resizeProductImages, restrictTo('business', 'admin'), updateProduct)

module.exports = router
