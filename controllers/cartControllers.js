const Cart = require('../model/cartModel')
const factory = require('./handleFactory')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const StockProduct = require('../model/stockProductModel')
const OndemandProduct = require('../model/ondemandProductModel')

exports.setCartUserIds = (req, res, next) => {
  if(!req.body.user) req.body.user = req.user.id
  next()
}

exports.createCart = factory.createOne(Cart)
exports.getAllCart = factory.getAll(Cart)
exports.getSingleCart = factory.getOne(Cart)

exports.updateCart = factory.updateOne(Cart)

exports.deleteCart = factory.deleteOne(Cart)


exports.addItem = catchAsync(async (req, res, next) => {
  const userId = req.user.id
  const productId = req.params.id

  const quantity = req.body.orderQuantity
  const unit = req.body.orderUnit

  const stock = await StockProduct.findById(productId)
  const ondemand = await OndemandProduct.findById(productId)

  console.log("stock: ", stock)
  console.log("ondemand: ", ondemand)

  const businessProfile = (stock || ondemand)
  const businessProfileId = await businessProfile.businessProfile._id

  let cart = await Cart.findOne({ user: userId })
  if(!cart) {
    // If cart does not exists
    if(stock) {
      cart = await Cart.create({ user: userId, items: [{ stockProduct: productId, orderQuantity: quantity, orderUnit: unit }] })
    } else if(ondemand) {
      cart = await Cart.create({ user: userId, items: [{ ondemandProduct: productId, orderQuantity: quantity, orderUnit: unit }] })
    }
    
  }else {
    // If cart exists

    for(let i = 0; i < cart.items.length; i++) {
      if(cart.items[i].stockProduct) {
        if(JSON.stringify(businessProfileId) !== JSON.stringify(cart.items[i].stockProduct.businessProfile._id)) {
          return next(new AppError(`You can only add items from a single farm`, 404))
        }
      } else if(cart.items[i].ondemandProduct) {
        if(JSON.stringify(businessProfileId) !== JSON.stringify(cart.items[i].ondemandProduct.businessProfile._id)) {
          return next(new AppError(`You can only add items from a single farm`, 404))
        }
      }
    }

    for(let i = 0; i < cart.items.length; i++) {
      if(cart.items[i].stockProduct) {

        if(JSON.stringify(cart.items[i].stockProduct._id) === JSON.stringify(productId)) {
          return next(new AppError(`Item already exists`, 404))
        }
      } else if(cart.items[i].ondemandProduct) {
        
        if(JSON.stringify(cart.items[i].ondemandProduct._id) === JSON.stringify(productId)) {
          return next(new AppError(`Item already exists`, 404))
        }
      }
    }

    if(stock) {
      cart.items.push({ stockProduct: productId, orderQuantity: quantity, orderUnit: unit })
    } else if(ondemand) {
      cart.items.push({ ondemandProduct: productId, orderQuantity: quantity, orderUnit: unit })
    }
    
    cart = await cart.save()
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: cart
    }
  })
  
})

exports.removeItem = catchAsync(async (req, res, next) => {
  const userId = req.user.id

  const productId = req.params.id

  const product = (await StockProduct.findById(productId) || await OndemandProduct.findById(productId))

  if(!product) {
    return next(new AppError(`Id doesn't exists`, 404))
  }

  let cart = await Cart.findOne({ user: userId })

  if(!cart) {
    return next(new AppError(`Cart is not found for this user`, 404))
  }

  let itemIndex = cart.items.findIndex(p => 
    (p.stockProduct && p.stockProduct || p.ondemandProduct && p.ondemandProduct)._id == productId)

  if(itemIndex > -1) {
    cart.items.splice(itemIndex, 1)
    cart = await cart.save()
  } else {
    return next(new AppError(`Item does not exists in cart`, 400))
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: cart
    }
  })
})


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

