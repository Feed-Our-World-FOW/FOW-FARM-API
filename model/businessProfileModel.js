const mongoose = require('mongoose')

const businessProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Profile must belongs to a user'],
      unique: true
    },
    walletAddress: {
      type: String,
      unique: true
    },
    location: {
      type: {
        type: String,
        // default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    shippingCostStandard: {
      type: Number,
      default: 0
    },
    shippingTimeStandard: {
      type: String,
      default: "7 - 14 business days"
    },
    shippingCostExpress: {
      type: Number,
      default: 1
    },
    shippingTimeExpress: {
      type: String,
      default: "3 - 5 business days"
    },
    shippingRadius: {
      type: Number,
      default: 100
    },
    shippingOndemandTime: {
      type: String,
      default: "45 - 60 business days"
    },
    shippingOndemandCost: {
      type: Number,
      default: 0
    },
    // stockProduct: {

    // },
    orderReceived: {
      type: Number,
      default: 0
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, 'rating must be greater then or equal then 1.0'],
      max: [5, 'rating must be less then or equal then 5.0'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

businessProfileSchema.index({ ratingsAverage: -1 })
businessProfileSchema.index({ location: '2dsphere' })

businessProfileSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name email photo'
  })

  next()
})

businessProfileSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'businessProfile',
  localField: '_id'
})

businessProfileSchema.virtual('stockProducts', {
  ref: 'StockProduct',
  foreignField: 'businessProfile',
  localField: '_id'
})

businessProfileSchema.virtual('ondemandProducts', {
  ref: 'OndemandProduct',
  foreignField: 'businessProfile',
  localField: '_id'
})

const BusinessProfile = mongoose.model('BusinessProfile', businessProfileSchema)
module.exports = BusinessProfile
