const express = require('express')
const {
  getAllMeatReviews,
  createMeatReview,
  deleteMeatReview,
  setFarmUserIds,
  getMeatReview,
  updateMeatReview
} = require('../controllers/reviewMeatControllers')

const {
  protect,
  restrictTo
} = require('../controllers/authControllers')

const router = express.Router({ mergeParams: true})

router.use(protect)

router
  .route('/')
    .get(getAllMeatReviews)
    .post(restrictTo('user'), setFarmUserIds, createMeatReview)

router
  .route('/:id')
    .delete(restrictTo('user', 'admin'), deleteMeatReview)
    .get(getMeatReview)
    .patch(restrictTo('user', 'admin'), updateMeatReview)

module.exports = router
