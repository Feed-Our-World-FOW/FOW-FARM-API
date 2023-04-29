const mongoose = require('mongoose')

const ondemandProductSchema = new mongoose.Schema(
  {
    producer: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, "Must belongs to a producer"]
    },
    businessProfile: {
      type: mongoose.Schema.ObjectId,
      ref: 'BusinessProfile',
      required: [true, "Must have a business profile"]
    },
    product: {
      type: String,
      required: [true, "Must contain a product"]
    },
    name: {
      type: String,
      required: [true, "Must have a name"]
    },
    image: {
      type: String,
    },
    capacity: {
      type: Number,
      required: [true, "Must have a capacity"]
    },
    unit: {
      type: String,
      enum: ['lb', 'kg', 'oz'],
      default: 'lb',
      required: [true, "Must have a unit"]
    },
    price: {
      type: Number
    },
    organic: {
      type: String,
      enum: ['yes', 'no'],
      required: [true, "Must select organic"]
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

ondemandProductSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'producer',
    select: 'name email photo'
  })

  next()
})

ondemandProductSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'businessProfile',
    select: 'walletAddress'
  })

  next()
})

const OndemandProduct = mongoose.model('OndemandProduct', ondemandProductSchema)
module.exports = OndemandProduct
