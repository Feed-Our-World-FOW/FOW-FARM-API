const express = require('express')
const router = express.Router({ mergeParams: true })

const {
  getAllOndemandProduct,
  createOndemandProduct,
  getSingleOndemandProduct,
  updateOndemandProduct,
  deleteOndemandProduct,
  setBusinessId,
  check,
  uploadOndemandProductPhoto,
  resizeOndemandProductPhoto,
  getMyOndemandProduct
} = require('../controllers/ondemandProductControllers')

const {
  protect,
  restrictTo
} = require('../controllers/authControllers')

router.use(protect)

router.route('/myOndemandProduct').get(getMyOndemandProduct)

router.route('/')
  .post(restrictTo('business'), setBusinessId, check, createOndemandProduct)
  .get(getAllOndemandProduct)

router.route('/:id')
  .get(getSingleOndemandProduct)
  .patch(uploadOndemandProductPhoto, resizeOndemandProductPhoto, updateOndemandProduct)
  .delete(deleteOndemandProduct)

module.exports = router
