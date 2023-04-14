const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, 'must have a product name']
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'must have a product summary'],
      maxlength: [200, 'Summary must contains less then or equal to 200 characters']
    },
    price: {
      type: Number,
      required: [true, 'must have a product price']
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
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'must belongs to a owner']
    },
    description: {
      type: String,
      required: [true, 'must have product description'],
      maxlength: [500, 'Description must contains less then or equal to 500 characters']
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
      required: [true, 'must have product amount']
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

productSchema.index({ ratingsAverage: -1 })

// productSchema.pre(/^find/, function(next) {
//   this.populate({
//     path: 'productReviews'
//   })
//   next()
// })

productSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'owner',
    select: 'name photo email'
  })
  next()
})

productSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'farm',
    select: 'name'
  })
  next()
})

productSchema.virtual('productReviews', {
  ref: 'ReviewProduct',
  foreignField: 'product',
  localField: '_id'
})

const Product = mongoose.model('Product', productSchema)

module.exports = Product
