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


router.route('/myOndemandProduct').get(protect, getMyOndemandProduct)

router.route('/')
.post(protect, restrictTo('business'), uploadOndemandProductPhoto, resizeOndemandProductPhoto, setBusinessId, check, createOndemandProduct)
.get(getAllOndemandProduct)

router.use(protect)

router.route('/:id')
  .get(getSingleOndemandProduct)
  .patch(uploadOndemandProductPhoto, resizeOndemandProductPhoto, updateOndemandProduct)
  .delete(deleteOndemandProduct)

module.exports = router
