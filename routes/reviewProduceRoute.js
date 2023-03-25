const express = require('express')
const {
  getAllProduceReviews,
  createProduceReview,
  deleteProduceReview,
  setFarmUserIds,
  getProduceReview,
  updateProduceReview
} = require('../controllers/reviewProduceControllers')

const {
  protect,
  restrictTo
} = require('../controllers/authControllers')

const router = express.Router({ mergeParams: true})

router.use(protect)

router
  .route('/')
    .get(getAllProduceReviews)
    .post(restrictTo('user'), setFarmUserIds, createProduceReview)

router
  .route('/:id')
    .delete(restrictTo('user', 'admin'), deleteProduceReview)
    .get(getProduceReview)
    .patch(restrictTo('user', 'admin'), updateProduceReview)

module.exports = router
