const express = require('express')
const {
  getAllProductReviews,
  createProductReview,
  deleteProductReview,
  setProductUserIds,
  getProductReview,
  updateProductReview
} = require('../controllers/reviewProductControllers')

const {
  protect,
  restrictTo
} = require('../controllers/authControllers')

const router = express.Router({ mergeParams: true})

router.use(protect)

router
  .route('/')
    .get(getAllProductReviews)
    .post(restrictTo('user'), setProductUserIds, createProductReview)

router
  .route('/:id')
    .delete(restrictTo('user', 'admin'), deleteProductReview)
    .get(getProductReview)
    .patch(restrictTo('user', 'admin'), updateProductReview)

module.exports = router
