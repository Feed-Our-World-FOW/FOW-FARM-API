const mongoose = require('mongoose')

const produceSchema = new mongoose.Schema(
  {
    vegetableName: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, 'must have a vegetable name']
    },
    price: {
      type: Number,
      required: [true, 'must have a vegetable price']
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
      required: [true, 'must have produce description']
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
      required: [true, 'must have produce amount']
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

produceSchema.index({ ratingsAverage: -1 })

// produceSchema.pre(/^find/, function(next) {
//   this.populate({
//     path: 'reviews'
//   })
//   next()
// })

produceSchema.virtual('ProduceReviews', {
  ref: 'ReviewProduce',
  foreignField: 'produce',
  localField: '_id'
})

const Produce = mongoose.model('Produce', produceSchema)

module.exports = Produce

