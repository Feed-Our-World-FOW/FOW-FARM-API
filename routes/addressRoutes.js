const express = require('express')

const {
  createAddress,
  getAllAddress,
  getSingleAddress,
  updateAddress,
  deleteAddress,
  setUserUserId,
  getMyAddress,
  updateMyAddress
} = require('../controllers/addressControllers')

const {
  protect,
  restrictTo
} = require('../controllers/authControllers')

const router = express.Router()

router.use(protect)

router.route('/myAddress').get(getMyAddress)
router.route('/myAddress').patch(updateMyAddress)

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
  