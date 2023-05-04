const express = require('express')

const {
  addFarm,
  getMyFavouriteFarms,
  removeFarm
} = require('../controllers/favouriteFarmControllers')

const {
  protect,
  restrictTo
} = require('../controllers/authControllers')

const router = express.Router()

router.use(protect)

router.route('/').get(getMyFavouriteFarms)

router.route('/:farmId')
  .post(addFarm)
  .delete(removeFarm)

module.exports = router
