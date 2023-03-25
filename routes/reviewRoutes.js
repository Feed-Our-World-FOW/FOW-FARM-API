const express = require('express')
const {
  getAllReviews,
  createReview,
  deleteReview,
  setFarmUserIds,
  getReview,
  updateReview
} = require('../controllers/reviewControllers')

const {
  protect,
  restrictTo
} = require('../controllers/authControllers')

const router = express.Router({ mergeParams: true})

router.use(protect)

router
  .route('/')
    .get(getAllReviews)
    .post(restrictTo('user'), setFarmUserIds, createReview)

router
  .route('/:id')
    .delete(restrictTo('user', 'admin'), deleteReview)
    .get(getReview)
    .patch(restrictTo('user', 'admin'), updateReview)

module.exports = router
