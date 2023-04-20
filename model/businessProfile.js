const mongoose = require('mongoose')

const businessProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Profile must belongs to a user']
  },
  address: {
    type: mongoose.Schema.ObjectId,
    ref: 'Address'
  },
  walletAddress: {
    type: String,
    unique: true
  },
  shippingCost: {
    type: Number,
  },
  shippingTime: {
    type: Number
  },
  shippingRadius: {
    type: Number
  },
  orderReceived: [

  ],
  ratings: [
    
  ]
})

const BusinessProfile = mongoose.model('BusinessProfile', businessProfileSchema)
module.exports = BusinessProfile
