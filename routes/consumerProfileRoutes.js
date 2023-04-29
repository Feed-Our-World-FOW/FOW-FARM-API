const express = require('express')
const router = express.Router()

const {
  createConsumerProfile,
  getAllConsumers,
  getSingleConsumer,
  updateConsumer,
  deleteConsumer,
  getMyProfile
} = require('../controllers/consumerProfileControllers')

const {
  protect,
  restrictTo
} = require('../controllers/authControllers')

router.use(protect)

router.route('/myProfile').get(getMyProfile, getAllConsumers)

router.route('/')
  .post(restrictTo('user'), createConsumerProfile)
  .get(getAllConsumers)

router.route('/:id')
  .get(getSingleConsumer)
  .patch(updateConsumer)
  .delete(deleteConsumer)

module.exports = router
