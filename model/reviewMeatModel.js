const mongoose = require('mongoose')
const Meat = require('./meatModel')

const reviewMeatSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'ReviewMeat can not be empty!']
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
    meat: {
      type: mongoose.Schema.ObjectId,
      ref: 'Meat',
      required: [true, 'review must belongs to a Meat']
    },
    // produce: {
    //   type: mongoose.Schema.ObjectId,
    //   ref: 'Produce',
    // },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'ReviewMeat must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
  
)

reviewMeatSchema.index({ meat: 1, user: 1 }, { unique: true })

reviewMeatSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  })
  
  next()
})

// Calculate the average rating of a farm by reviews
reviewMeatSchema.statics.calcAverageRatingOfMeat = async function(meatId) {

  // Calculate the statistics of number of rating and average
  const stats = await this.aggregate([
    {
      $match: { meat: meatId }
    },
    {
      $group: {
        _id: '$meat',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ])

  // Set the farm's number of rating and rating average
  if(stats.length > 0) {
    await Meat.findByIdAndUpdate(meatId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    })
  }else {
    await Meat.findByIdAndUpdate(meatId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    })
  }
}


// Call the function after a new review is being created 
// (not working on updateReviewMeat or deleteReviewMeat )
reviewMeatSchema.post('save', function() {
  this.constructor.calcAverageRatingOfMeat(this.meat)
})

// --------------Set up the function "calcAverageRating" for "findOneAndUpdate" & "findOneAndDelete"
reviewMeatSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne()
  next()
})

reviewMeatSchema.post(/^findOneAnd/, async function() {
  await this.r.constructor.calcAverageRatingOfMeat(this.r.meat)
})
// -------------------


const ReviewMeat = mongoose.model('ReviewMeat', reviewMeatSchema)

module.exports = ReviewMeat

