const mongoose = require("mongoose")

const buySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      // required: [true, "cart must contain some user"]
    },
    items: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: 'Product'
        },
        quantity: {
          type: Number,
          default: 0
        }
      }
    ],
    totalAmount: {
      type: Number,
      require: [true, "must contains totalAmount"]
    },
    totalQuentity: {
      type: Number,
      require: [true, "must contains totalQuentity"]
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
    paymentOption: {
      type: String,
      enum: ['Cash on delivery', 'UPI', 'Crypto', 'Strype'],
      required: [true, "Must required payament option"]
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// buySchema.pre()

const Buy = mongoose.model('Buy', buySchema)

module.exports = Buy
