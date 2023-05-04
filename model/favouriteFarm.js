const mongoose = require('mongoose')

const favouriteFarmSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    farms: [
      {
        businessAccount: {
          type: mongoose.Schema.ObjectId,
          ref: 'BusinessProfile'
        }
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

const FavouriteFarm = mongoose.model('FavouriteFarm', favouriteFarmSchema)

module.exports = FavouriteFarm
