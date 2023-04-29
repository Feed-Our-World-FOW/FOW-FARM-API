const mongoose = require('mongoose')
const BusinessProfile = require('./businessProfileModel')

const reviewSchema = new mongoose.Schema(
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
    businessProfile: {
      type: mongoose.Schema.ObjectId,
      ref: 'BusinessProfile',
      required: [true, 'Review must belongs to a Business Profile']
    },
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

reviewSchema.statics.calcAverageRating = async function(businessProfileId) {
  const stats = await this.aggregate([
    {
      $match: { businessProfile: businessProfileId }
    },
    {
      $group: {
        _id: '$businessProfile',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ])

  if(stats.length > 0) {
    await BusinessProfile.findByIdAndUpdate(businessProfileId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    })
  }else {
    await BusinessProfile.findByIdAndUpdate(businessProfileId, {
      ratingsQuantity: 0,
      ratingsAverage: 0
    })
  }
}


// Call the function after a new review is being created 
// (not working on updateReview or deleteReview )
reviewSchema.post('save', function() {
  this.constructor.calcAverageRating(this.businessProfile)

})

// --------------Set up the function "calcAverageRating" for "findOneAndUpdate" & "findOneAndDelete"
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne()
  next()
})

reviewSchema.post(/^findOneAnd/, async function() {
  await this.r.constructor.calcAverageRating(this.r.businessProfile)

})
// -------------------


const Review = mongoose.model('Review', reviewSchema)

module.exports = Review

