const express = require('express')
const router = express.Router()

const {
  createConsumerProfile,
  getAllConsumers,
  getSingleConsumer,
  updateConsumer,
  deleteConsumer,
  getMyProfile,
  updateMyConsumerProfile
} = require('../controllers/consumerProfileControllers')

const {
  protect,
  restrictTo
} = require('../controllers/authControllers')

router.use(protect)

router.route('/myProfile')
  .get(getMyProfile, getAllConsumers)
  .patch(updateMyConsumerProfile)

router.route('/')
  .post(restrictTo('user'), createConsumerProfile)
  .get(getAllConsumers)

router.route('/:id')
  .get(getSingleConsumer)
  .patch(updateConsumer)
  .delete(deleteConsumer)

module.exports = router
