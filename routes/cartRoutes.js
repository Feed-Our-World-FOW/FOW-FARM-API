const express = require('express')

const {
  createCart,
  getCart,
  updateCart,
  deleteCart,
  getAllCart,
  setCartUserIds,
  getMyCart,
  addToCart,
  removeFromCart,
  decreaseQuantity
} = require('../controllers/cartControllers')

const {
  protect,
  restrictTo
} = require('../controllers/authControllers')

const router = express.Router()

router.use(protect)

router
  .post('/:id/add', addToCart)

router
  .delete('/:id/remove', removeFromCart)

router
  .patch('/:id/decrease', decreaseQuantity)
    

// router.route('/mycart').get(getMycart).patch(addItemsTocart)
router.route('/mycart').get(getMyCart)

router
  .route('/')
    .post(setCartUserIds, createCart)
    .get(restrictTo('admin'), getAllCart)

router
  .route('/:id')
    .get(restrictTo('admin'), getCart)
    .patch(updateCart)
    // .patch(addItemsTocart)
    .delete(deleteCart)


module.exports = router

