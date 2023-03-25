const mongoose = require('mongoose')
const Product = require('./productModel')

const reviewProductSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    // farm: {
    //   type: mongoose.Schema.ObjectId,
    //   ref: 'Farm',
    //   required: [true, 'review must belongs to a farm']
    // },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'review must belongs to a Product']
    },
    // produce: {
    //   type: mongoose.Schema.ObjectId,
    //   ref: 'Produce',
    // },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
  
)

reviewProductSchema.index({ product: 1, user: 1 }, { unique: true })

reviewProductSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  })
  
  next()
})

// Calculate the average rating of a farm by reviews
reviewProductSchema.statics.calcAverageRatingOfProduct = async function(productId) {

  // Calculate the statistics of number of rating and average
  const stats = await this.aggregate([
    {
      $match: { product: productId }
    },
    {
      $group: {
        _id: '$product',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ])

  // Set the farm's number of rating and rating average
  if(stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    })
  }else {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    })
  }
}


// Call the function after a new review is being created 
// (not working on updateReviewProduct or deleteReviewProduct )
reviewProductSchema.post('save', function() {
  this.constructor.calcAverageRatingOfProduct(this.product)
})

// --------------Set up the function "calcAverageRating" for "findOneAndUpdate" & "findOneAndDelete"
reviewProductSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne()
  next()
})

reviewProductSchema.post(/^findOneAnd/, async function() {
  await this.r.constructor.calcAverageRatingOfProduct(this.r.product)
})
// -------------------


const ReviewProduct = mongoose.model('ReviewProduct', reviewProductSchema)

module.exports = ReviewProduct

