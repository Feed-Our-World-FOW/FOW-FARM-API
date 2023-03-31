const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
  country: {
    type: String,
    required: [true, 'Address must have Country']
  },
  mobileNumber: {
    type: Number,
    required: [true, 'Address must have mobile number']
  },
  pincode: {
    type: Number,
    required: [true, 'Address must have a pincode']
  },
  flatDetails: {
    type: String
  },
  landMark: {
    type: String
  },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'address must belongs to a user']
  },
  town: {
    type: String,
    required: [true, 'Address must have a town']
  }
},{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

addressSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name'
  })

  next()
})

const Address = mongoose.model('Address', addressSchema)

module.exports = Address

