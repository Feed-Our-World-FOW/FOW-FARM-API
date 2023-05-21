const mongoose = require('mongoose')
const ConsumerProfile = require('./consumerProfileModel')
const BusinessProfile = require('./businessProfileModel')

const buySchema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now()
    },
    consumerProfile: {
      type: mongoose.Schema.ObjectId,
      ref: 'ConsumerProfile',
      required: [true, 'Must belongs to a consumer profile']
    },
    cart: {
      type: mongoose.Schema.ObjectId,
      ref: 'Cart',
      required: [true, 'Must have a cart']
    },
    businessProfile: {
      type: mongoose.Schema.ObjectId,
      ref: 'BusinessProfile',
      required: [true, 'Must belongs to a business profile']
    },
    paymentOption: {
      type: String,
      enum: ['Cash on delivery', 'UPI', 'Crypto', 'Strype'],
      required: [true, "Must required payament option"]
    },
    deliveryType: {
      type: String,
      enum: ['standard', 'express'],
      default: 'standard',
      required: [true, "Must have a delivery type"]
    },
    totalAmount: {
      type: Number,
    },
    receipt: {
      type: String
    },
    paid: {
      type: Boolean,
      default: false
    },
    delivered: {
      type: Boolean,
      default: false
    },
    
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

buySchema.pre(/^find/, function(next) {
  this.populate({
    path: 'consumerProfile',
    select: 'user location'
  })

  next()
})

buySchema.pre(/^find/, function(next) {
  this.populate({
    path: 'cart',
    select: '-user items subTotal'
  })

  next()
})

// buySchema.pre(/^find/, function(next) {
//   // this.populate({
//   //   path: 'totalAmount',
//   //   select: 'su'
//   // })
//   console.log("Total Amount")
//   console.log(this)
//   console.log(this.cart)
//   next()
// })

buySchema.statics.calcOrderNumber = async function(consumerProfileId) {
  const stats = await this.aggregate([
    {
      $match: { consumerProfile: consumerProfileId._id }
    },
    {
      $group: {
        _id: '$consumerProfile',
        nOrder: { $sum: 1 }
      }
    }
  ])

  if(stats.length > 0) {
    await ConsumerProfile.findByIdAndUpdate(consumerProfileId._id, {
      orders: stats[0].nOrder
    })
    
  } else {
    await ConsumerProfile.findByIdAndUpdate(consumerProfileId._id, {
      orders: 0
    })
    
  }
}

buySchema.statics.calcOrderReceived = async function(businessProfileId) {
  const stats = await this.aggregate([
    {
      $match: { businessProfile: businessProfileId._id }
    },
    {
      $group: {
        _id: '$businessProfile',
        nOrderReceived: { $sum: 1 }
      }
    }
  ])

  if(stats.length > 0) {
    await BusinessProfile.findByIdAndUpdate(businessProfileId._id, {
      orderReceived: stats[0].nOrderReceived
    })
  } else {
    await BusinessProfile.findByIdAndUpdate(businessProfileId._id, {
      orderReceived: 0
    })
  }
}

buySchema.post('save', function() {
  this.constructor.calcOrderNumber(this.consumerProfile)
  this.constructor.calcOrderReceived(this.businessProfile)
})

buySchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne()
  next()
})

buySchema.post(/^findOneAnd/, async function() {
  await this.r.constructor.calcOrderNumber(this.r.consumerProfile)
  await this.r.constructor.calcOrderReceived(this.r.businessProfile)
})


const Buy = mongoose.model('Buy', buySchema)

module.exports = Buy
