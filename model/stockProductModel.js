const mongoose = require('mongoose')

const stockProductSchema = new mongoose.Schema(
  {
    listDate: {
      type: Date,
      default: Date.now()
    },
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
    batch: {
      type: String,
      unique: true,
      required: [true, "Must contain a batch number"]
    },
    image: {
      type: String,
    },
    stock: {
      type: Number,
      required: [true, "Must have a stock"]
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
    },
    // expires: {
    //   type: Date,
    //   required: [true, "Must contain expire date"]
    // },
    freshRemain: {
      type: Number,
      required: [true, "Must contain freshRemain"]
    },
    subTotal: {
      type: Number,
      default: this.price
    },
    orderQuantity: {
      type: Number,
      default: 1
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// stockProductSchema.pre('save', async function(next) {
//   const total = 0
//   this.subTotal = total + 

//   next()
// })

stockProductSchema.pre('save', async function(next) {
  this.subTotal = this.price * this.orderQuantity

  next()
})

stockProductSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'producer',
    select: 'name email photo'
  })

  next()
})

stockProductSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'businessProfile',
    select: 'walletAddress'
  })

  next()
})

const StockProduct = mongoose.model('StockProduct', stockProductSchema)
module.exports = StockProduct
