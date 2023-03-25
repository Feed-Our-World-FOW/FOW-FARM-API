const mongoose = require("mongoose")

const buscketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      // required: [true, "buscket must contain some user"]
    },
    items: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: 'Product'
        },
        quantity: {
          type: Number,
          default: 0
        }
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

buscketSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  })
  next()
})


buscketSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'items.product',
    select: 'name image summery price weight amount'
  })
  next()
})

const Buscket = mongoose.model('Buscket', buscketSchema)

module.exports = Buscket
