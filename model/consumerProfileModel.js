const mongoose = require('mongoose')

const consumerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Profile must belongs to a user']
    },
    location: {
      type: {
        type: String,
        // default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    orders: {
      type: Number,
      default: 0
    },
    // favourite: {
    //   type: Number,
    //   default: 0
    // }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

consumerProfileSchema.index({ location: '2dsphere' })

consumerProfileSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name email photo'
  })

  next()
})

const ConsumerProfile = mongoose.model('ConsumerProfile', consumerProfileSchema)
module.exports = ConsumerProfile
