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
  getMyStockProduct,
  checkOwner
} = require('../controllers/stockProductControllers')

const {
  protect,
  restrictTo
} = require('../controllers/authControllers')

// router.use(protect)

router.route('/myStockProduct').get(protect, getMyStockProduct)

router.route('/')
  .post(protect, restrictTo('business'), uploadstockProductPhoto, resizestockProductPhoto, setBusinessId, check, createStockProduct)
  .get(getAllStockProducts)

router.use(protect)

router.route('/:id')
  .get(getSingleStockProduct)
  .patch(uploadstockProductPhoto, resizestockProductPhoto, updateStockProduct)
  .delete(restrictTo('business'), checkOwner, deleteStockProduct)

// router.route('/:id/add')
//   .get(getTotal)

module.exports = router
