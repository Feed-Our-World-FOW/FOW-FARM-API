const express = require('express')
const router = express.Router({ mergeParams: true})

const {
  createStockProduct,
  getAllStockProducts,
  getSingleStockProduct,
  updateStockProduct,
  deleteStockProduct,
  setBusinessId,
  check,
  uploadstockProductPhoto,
  resizestockProductPhoto,
  getMyStockProduct
} = require('../controllers/stockProductControllers')

const {
  protect,
  restrictTo
} = require('../controllers/authControllers')

router.use(protect)

router.route('/myStockProduct').get(getMyStockProduct)

router.route('/')
  .post(restrictTo('business'), setBusinessId, check, createStockProduct)
  .get(getAllStockProducts)

router.route('/:id')
  .get(getSingleStockProduct)
  .patch(uploadstockProductPhoto, resizestockProductPhoto, updateStockProduct)
  .delete(deleteStockProduct)

// router.route('/:id/add')
//   .get(getTotal)

module.exports = router