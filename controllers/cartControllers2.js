const Cart = require('../model/cartModel')
const Farm = require('../model/farmModel')
const Product = require('../model/productModel')
const factory = require('./handleFactory')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.setCartUserIds = (req, res, next) => {
  // Allow nested routes
  // if(!req.body.farm)  req.body.farm = req.params.farmId
  if(!req.body.user) req.body.user = req.user.id
  next();
};

exports.createCart = factory.createOne(Cart)
exports.getAllCart = factory.getAll(Cart)
exports.getCart = factory.getOne(Cart)
exports.updateCart = factory.updateOne(Cart)
exports.deleteCart = factory.deleteOne(Cart)

exports.getMyCart = catchAsync(async (req, res, next) => {
  let query = Cart.find({ user: req.user.id })
  const doc = await query

  res.status(200).json({
    status: 'success',
    data: {
      data: doc
    }
  })
})


exports.addToCart = catchAsync(async (req, res, next) => {

  const productId = req.params.id
  const userId = req.user.id

  const product = await Product.findById(productId);
  const farm = await Farm.findById(product.farm);
  
  let cart = await Cart.findOne({ user: userId })

  if(cart) {
    for(let i = 0; i < cart.items.length; i++) {
      if(JSON.stringify(farm._id) !== JSON.stringify(cart.items[i].product.farm._id)) {
        
        return next(new AppError(`You can only add items from a single farm`, 400))
      }
    }
    
    let itemIndex = cart.items.findIndex(p => p.product._id == productId)
    
    if(itemIndex > -1) {
      // Product exists in the cart
      // Update the quantity

      let productItem = cart.items[itemIndex]
      productItem.quantity += 1
      cart.items[itemIndex] = productItem
    } else {
      cart.items.push({ product: productId, quantity: 1 })
    }

    cart = await cart.save()

  } else {
    cart = await Cart.create({user: userId, items:[{ product: productId, quantity: 1 }]})
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: cart
    }
  })

})


exports.removeFromCart = catchAsync(async (req, res, next) => {

  const productId = req.params.id
  const userId = req.user.id

  const product = await Product.findById(productId);
  // const farm = await Farm.findById(product.farm);
  
  let cart = await Cart.findOne({ user: userId })

  if(!cart) {
    return next(new AppError(`Cart is not found for this user`, 404))
  }

  let itemIndex = cart.items.findIndex(p => p.product._id == productId)

  if(itemIndex > -1) {
    // Product exists in the cart
    // Update the quantity

    cart.items.splice(itemIndex, 1)
    cart = await cart.save()
    
  } else {

    return next(new AppError(`Item does not exist in cart`, 400))
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: cart
    }
  })
 

})


exports.decreaseQuantity = catchAsync(async (req, res, next) => {

  const productId = req.params.id
  const userId = req.user.id

  const product = await Product.findById(productId);
  // const farm = await Farm.findById(product.farm);
  
  let cart = await Cart.findOne({ user: userId })

  if(!cart) {
    return next(new AppError(`Cart is not found for this user`, 404))
  }

  let itemIndex = cart.items.findIndex(p => p.product._id == productId)

  if(itemIndex > -1) {
    // Product exists in the cart
    // Update the quantity

    let productItem = cart.items[itemIndex]
    if(productItem.quantity === 0) {
      return next(new AppError(`No item left with that Id`, 404))
    }
    productItem.quantity -= 1
    cart.items[itemIndex] = productItem

    cart = await cart.save()

  } else {

    return next(new AppError(`Item does not exist in cart`, 400))
  }
 
  res.status(200).json({
    status: 'success',
    data: {
      data: cart
    }
  })

})


