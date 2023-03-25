const express = require('express')

const {
  createProduce,
  getAllProduces,
  getProduce,
  updateProduce,
  deleteProduce,
  setFarmUserIds
} = require('../controllers/produceControllers')

const {
  protect,
  restrictTo
} = require('../controllers/authControllers')

const router = express.Router({ mergeParams: true})

router.use(protect)

router
  .route('/')
    .get(getAllProduces)
    .post(restrictTo('business'), setFarmUserIds, createProduce)

router
  .route('/:id')
    .delete(restrictTo('business', 'admin'), deleteProduce)
    .get(getProduce)
    .patch(restrictTo('business', 'admin'), updateProduce)

module.exports = router
