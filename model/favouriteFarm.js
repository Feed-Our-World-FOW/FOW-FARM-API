const mongoose = require('mongoose')
const ConsumerProfile = require('./consumerProfileModel')

const favouriteFarmSchema = new mongoose.Schema(
  {
    consumerProfile: {
      type: mongoose.Schema.ObjectId,
      ref: 'ConsumerProfile'
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

favouriteFarmSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'farms.businessAccount',
    select: 'user'
  })

  next()
})

// favouriteFarmSchema.statics.calcFavouriteFarmNumber = async function(consumerProfileId) {
//   const stats = await this.aggregate([
//     {
//       $match: { consumerProfile: consumerProfileId._id }
//     },
//     {
//       $unwind: "$farms"
//     },
//     {
//       $group: {
//         _id: '$farms.businessAccount',
//         nFavourite: { $sum: 1 }
//       }
//     }
//   ])

//   console.log(stats)

//   if(stats.length > 0) {
//     await ConsumerProfile.findByIdAndUpdate(consumerProfileId._id, {
//       favourite: stats[0].nFavourite
//     })
//   } else {
//     await ConsumerProfile.findByIdAndUpdate(consumerProfileId._id, {
//       favourite: 0
//     })
//   }
// }

// favouriteFarmSchema.post('save', function() {
//   this.constructor.calcFavouriteFarmNumber(this.consumerProfile)
// })

// favouriteFarmSchema.pre(/^findOneAnd/, async function(next) {
//   this.r = await this.findOne()
//   next()
// })

// favouriteFarmSchema.post(/^findOneAnd/, async function() {
//   await this.r.constructor.calcFavouriteFarmNumber(this.r.consumerProfile)
// })

const FavouriteFarm = mongoose.model('FavouriteFarm', favouriteFarmSchema)

module.exports = FavouriteFarm
