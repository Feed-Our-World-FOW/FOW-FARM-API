const mongoose = require('mongoose')

const meatSchema = new mongoose.Schema(
  {
    animalName: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, 'must have a animal name']
    },
    cuts: {
      type: String,
      required: [true, 'must have cuts']
    },
    price: {
      type: Number,
      required: [true, 'must have a meat price']
    },
    listedAt: {
      type: Date,
      default: Date.now()
    },
    farm: {
      type: mongoose.Schema.ObjectId,
      ref: 'Farm',
      required: [true, 'must belongs to a farm']
    },
    description: {
      type: String,
      required: [true, 'must have meat description']
    },
    image: {
      type: [String]
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must be greater then or equal then 1.0'],
      max: [5, 'rating must be less then or equal then 5.0'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    weight: {
      type: String,
      required: [true, 'must have weight']
    },
    amount: {
      type: Number,
      required: [true, 'must have meat amount']
    },
    available: {
      type: Boolean,
      default: true
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

meatSchema.index({ ratingsAverage: -1 })

meatSchema.virtual('meatReviews', {
  ref: 'ReviewMeat',
  foreignField: 'meat',
  localField: '_id'
})

const Meat = mongoose.model('Meat', meatSchema)

module.exports = Meat
