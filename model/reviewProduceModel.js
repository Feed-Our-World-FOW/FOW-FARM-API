const mongoose = require('mongoose')
const Produce = require('./produceModel')

const reviewProduceSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'ReviewProduce can not be empty!']
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
    // meat: {
    //   type: mongoose.Schema.ObjectId,
    //   ref: 'Meat',
    // },
    produce: {
      type: mongoose.Schema.ObjectId,
      ref: 'Produce',
      required: [true, 'review must belongs to a Produce']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'ReviewProduce must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
  
)

reviewProduceSchema.index({ farm: 1, user: 1 }, { unique: true })

reviewProduceSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  })
  
  next()
})

// Calculate the average rating of a farm by reviews
reviewProduceSchema.statics.calcAverageRatingOfProduce = async function(produceId) {

  // Calculate the statistics of number of rating and average
  const stats = await this.aggregate([
    {
      $match: { produce: produceId }
    },
    {
      $group: {
        _id: '$produce',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ])

  // Set the farm's number of rating and rating average
  if(stats.length > 0) {
    await Produce.findByIdAndUpdate(produceId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    })
  }else {
    await Produce.findByIdAndUpdate(produceId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    })
  }
}


// Call the function after a new review is being created 
// (not working on updateReviewProduce or deleteReviewProduce )
reviewProduceSchema.post('save', function() {
  this.constructor.calcAverageRatingOfProduce(this.produce)
})

// --------------Set up the function "calcAverageRating" for "findOneAndUpdate" & "findOneAndDelete"
reviewProduceSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne()
  next()
})

reviewProduceSchema.post(/^findOneAnd/, async function() {
  await this.r.constructor.calcAverageRatingOfProduce(this.r.produce)
})
// -------------------


const ReviewProduce = mongoose.model('ReviewProduce', reviewProduceSchema)

module.exports = ReviewProduce

