const express = require('express')

const {
  createBuscket,
  getBuscket,
  updateBuscket,
  deleteBuscket,
  getAllBuscket,
  setBuscketUserIds,
  getMyBuscket,
  addItemsToBuscket
} = require('../controllers/buscketControllers')

const {
  protect,
  restrictTo
} = require('../controllers/authControllers')

const router = express.Router()

router.use(protect)

// router.route('/myBuscket').get(getMyBuscket).patch(addItemsToBuscket)
router.route('/myBuscket').get(getMyBuscket)

router
  .route('/')
    .post(setBuscketUserIds, createBuscket)
    .get(restrictTo('admin'), getAllBuscket)

router
  .route('/:id')
    .get(restrictTo('admin'), getBuscket)
    .patch(updateBuscket)
    // .patch(addItemsToBuscket)
    .delete(deleteBuscket)


module.exports = router

