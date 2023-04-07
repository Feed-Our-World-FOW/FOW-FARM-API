const mongoose = require('mongoose')
const Farm = require('./farmModel')
// const Meat = require('./meatModel')
// const Produce = require('./produceModel')
const Product = require('./productModel')

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Review can not be empty!']
    },
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
    farm: {
      type: mongoose.Schema.ObjectId,
      ref: 'Farm',
      required: [true, 'review must belongs to a farm']
    },
    // meat: {
    //   type: mongoose.Schema.ObjectId,
    //   ref: 'Meat',
    // },
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

reviewSchema.index({ farm: 1, user: 1 }, { unique: true })

reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  })
  
  next()
})

// Calculate the average rating of a farm by reviews
reviewSchema.statics.calcAverageRating = async function(farmId) {

  // Calculate the statistics of number of rating and average
  const stats = await this.aggregate([
    {
      $match: { farm: farmId }
    },
    {
      $group: {
        _id: '$farm',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ])

  // Set the farm's number of rating and rating average
  if(stats.length > 0) {
    await Farm.findByIdAndUpdate(farmId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    })
  }else {
    await Farm.findByIdAndUpdate(farmId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    })
  }
}

// Calculate the average rating of a farm by reviews
// reviewSchema.statics.calcAverageRatingOfMeat = async function(meatId) {

//   // Calculate the statistics of number of rating and average
//   const stats = await this.aggregate([
//     {
//       $match: { meat: meatId }
//     },
//     {
//       $group: {
//         _id: '$meat',
//         nRating: { $sum: 1 },
//         avgRating: { $avg: '$rating' }
//       }
//     }
//   ])

//   // Set the farm's number of rating and rating average
//   if(stats.length > 0) {
//     await Meat.findByIdAndUpdate(meatId, {
//       ratingsQuantity: stats[0].nRating,
//       ratingsAverage: stats[0].avgRating
//     })
//   }else {
//     await Meat.findByIdAndUpdate(meatId, {
//       ratingsQuantity: 0,
//       ratingsAverage: 4.5
//     })
//   }
// }


// Calculate the average rating of a farm by reviews
// reviewSchema.statics.calcAverageRatingOfProduce = async function(produceId) {

//   // Calculate the statistics of number of rating and average
//   const stats = await this.aggregate([
//     {
//       $match: { produce: produceId }
//     },
//     {
//       $group: {
//         _id: '$produce',
//         nRating: { $sum: 1 },
//         avgRating: { $avg: '$rating' }
//       }
//     }
//   ])

//   // Set the farm's number of rating and rating average
//   if(stats.length > 0) {
//     await Produce.findByIdAndUpdate(produceId, {
//       ratingsQuantity: stats[0].nRating,
//       ratingsAverage: stats[0].avgRating
//     })
//   }else {
//     await Produce.findByIdAndUpdate(produceId, {
//       ratingsQuantity: 0,
//       ratingsAverage: 4.5
//     })
//   }
// }


// Calculate the average rating of a farm by reviews
reviewSchema.statics.calcAverageRatingOfProduct = async function(productId) {

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
// (not working on updateReview or deleteReview )
reviewSchema.post('save', function() {
  this.constructor.calcAverageRating(this.farm)

  // this.constructor.calcAverageRatingOfMeat(this.meat)
  // this.constructor.calcAverageRatingOfProduce(this.produce)
  this.constructor.calcAverageRatingOfProduct(this.product)
})

// --------------Set up the function "calcAverageRating" for "findOneAndUpdate" & "findOneAndDelete"
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne()
  next()
})

reviewSchema.post(/^findOneAnd/, async function() {
  await this.r.constructor.calcAverageRating(this.r.farm)

  // await this.r.constructor.calcAverageRatingOfMeat(this.r.meat)
  // await this.r.constructor.calcAverageRatingOfProduce(this.r.produce)
  await this.r.constructor.calcAverageRatingOfProduct(this.r.product)
})
// -------------------


const Review = mongoose.model('Review', reviewSchema)

module.exports = Review

