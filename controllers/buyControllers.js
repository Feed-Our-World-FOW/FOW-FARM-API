const Buy = require('../model/buyModel')
const ConsumerProfile = require('../model/consumerProfileModel')
const BusinessProfile = require('../model/businessProfileModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handleFactory')
const Cart = require('../model/cartModel')
const axios = require('axios')

exports.createBuy = catchAsync(async (req, res, next) => {
  const businessProfile = await BusinessProfile.findById(req.body.businessProfile)

  if(typeof(req.body.cart.items[0].ondemandProduct) !== "undefined") {
    req.body.totalAmount = req.body.cart.subTotal + businessProfile.shippingOndemandCost
  } else {
    if(req.body.deliveryType === "express") {
      req.body.totalAmount = req.body.cart.subTotal + businessProfile.shippingCostExpress
    } else if(req.body.deliveryType === "standard") {
      req.body.totalAmount = req.body.cart.subTotal + businessProfile.shippingCostStandard
    }
  }

  const doc = await Buy.create(req.body)

  res.status(200).json({
    status: 'success',
    data: {
      data: doc
    }
  })
})

exports.setConsumerProfile = catchAsync(async (req, res, next) => {
  const consumerProfile = await ConsumerProfile.findOne({ user: req.user.id })
  if(!consumerProfile) {
    return next(new AppError(`You don't have any Consumer Profile, please create one before procced`, 404))
  }

  const cart = await Cart.findOne({ user: req.user.id })
  if(!cart) {
    return next(new AppError(`Can't find any cart associated with this profile`, 404))
  }

  let businessProfile = {}

  if (cart?.items[0].stockProduct) {
    businessProfile = cart?.items[0].stockProduct.businessProfile
  } else if(cart?.items[0].ondemandProduct) {
    businessProfile = cart?.items[0].ondemandProduct.businessProfile
  }

  if(!req.body.consumerProfile) req.body.consumerProfile = consumerProfile
  if(!req.body.cart) req.body.cart = cart
  if(!req.body.businessProfile) req.body.businessProfile = businessProfile
  next()
})

exports.getMyOrderForConsumer = catchAsync(async (req, res, next) => {
  const consumerProfile = await ConsumerProfile.findOne({ user: req.user.id })
  if(!consumerProfile) {
    return next(new AppError(`You don't have any consumer profile`, 404))
  }
  const order = await Buy.find({ consumerProfile: consumerProfile._id })
  if(!order) {
    return next(new AppError(`You don't have any order`, 404))
  }

  res.status(200).json({
    status: 'success',
    results: order.length,
    data: {
      data: order
    }
  })

})

exports.getMyOrdersForBusiness = catchAsync(async (req, res, next) => {
  const business = await BusinessProfile.findOne({ user: req.user.id })
  if(!business) {
    return next(new AppError(`You don't have any business account`, 404))
  }

  const buy = await Buy.find({ businessProfile: business._id })
  if(!buy) {
    return next(new AppError(`You don't have any order yet`, 404))
  }

  res.status(201).json({
    status: 'success',
    results: buy.length,
    data: {
      data: buy
    }
  })
})

exports.getAmount = catchAsync(async (req, res, next) => {

  // console.log(req.query)
  
  const businessProfile = await BusinessProfile.findById(req.body.businessProfile)

  if(typeof(req.body.cart.items[0].ondemandProduct) !== "undefined") {
    req.body.totalAmount = req.body.cart.subTotal + businessProfile.shippingOndemandCost
    
  } else {
    if(req.query.deliveryType === "express") {
      req.body.totalAmount = req.body.cart.subTotal + businessProfile.shippingCostExpress
      
    } else if(req.query.deliveryType === "standard") {
      req.body.totalAmount = req.body.cart.subTotal + businessProfile.shippingCostStandard
      
    }
  }

  const celoData = await axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=celo&order=market_cap_desc&per_page=100&page=1&sparkline=false&locale=en`)

  const celoPrice = celoData.data[0].current_price
  const totalAmountInCELO = celoPrice * req.body.totalAmount

  res.status(200).json({
    status: 'success',
    data: {
      data: {
        totalAmountInUSD: req.body.totalAmount,
        totalAmountInCELO
      }
    }
  })


})

// exports.createBuy = factory.createOne(Buy)
exports.getAllBuy = factory.getAll(Buy)
exports.getSingleBuy = factory.getOne(Buy)
exports.updateBuy = factory.updateOne(Buy)
exports.deleteBuy = factory.deleteOne(Buy)
