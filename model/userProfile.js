const mongoose = require('mongoose')

const userProfileSchema = new mongoose.Schema({
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
  orders: [

  ],
  favourite: [

  ]
})

const UserProfile = mongoose.model('UserProfile', userProfileSchema)
module.exports = UserProfile
