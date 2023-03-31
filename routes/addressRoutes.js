const express = require('express')

const {
  createAddress,
  getAllAddress,
  getSingleAddress,
  updateAddress,
  deleteAddress,
  setUserUserId
} = require('../controllers/addressControllers')

const {
  protect,
  restrictTo
} = require('../controllers/authControllers')

const router = express.Router()

router.use(protect)

router
  .route('/')
    .post(setUserUserId, createAddress)
    .get(restrictTo('admin'), getAllAddress)

router
  .route('/:id')
    .patch(updateAddress)
    .delete(deleteAddress)
    .get(getSingleAddress)

module.exports = router
  