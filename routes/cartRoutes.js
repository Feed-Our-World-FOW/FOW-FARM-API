const express = require('express')

const {
  createCart,
  getAllCart,
  getMyCart,
  getSingleCart,
  updateCart,
  deleteCart,
  setCartUserIds,
  addItem,
  removeItem
} = require('../controllers/cartControllers')

const {
  protect,
  restrictTo
} = require('../controllers/authControllers')

const router = express.Router()

router.use(protect)

router.route('/:id/remove').delete(removeItem)
router.route('/:id/add').post(addItem)

router.route('/myCart').get(getMyCart)

router.route('/')
  // .post(restrictTo('user'), setCartUserIds, createCart)
  .post(restrictTo('user'), setCartUserIds, addItem)
  .get(restrictTo('admin'), getAllCart)

router.route('/:id')
  .get(restrictTo('admin', 'user'), getSingleCart)
  .patch(restrictTo('user'), updateCart)
  .delete(restrictTo('user'), deleteCart)
  // .delete(restrictTo('user'), removeItem)

module.exports = router
