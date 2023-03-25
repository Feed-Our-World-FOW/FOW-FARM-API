const express = require('express')

const {
  createMeat,
  getAllMeats,
  getMeat,
  updateMeat,
  deleteMeat,
  setFarmUserIds
} = require('../controllers/meatControllers')

const {
  protect,
  restrictTo
} = require('../controllers/authControllers')

const router = express.Router({ mergeParams: true})

router.use(protect)

router
  .route('/')
    .get(getAllMeats)
    .post(restrictTo('business'), setFarmUserIds, createMeat)

router
  .route('/:id')
    .delete(restrictTo('business', 'admin'), deleteMeat)
    .get(getMeat)
    .patch(restrictTo('business', 'admin'), updateMeat)

module.exports = router
