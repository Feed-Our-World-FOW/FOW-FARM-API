const mongoose = require("mongoose")

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      // required: [true, "cart must contain some user"]
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
    ],
    subTotal: {
      type: Number,
      default: 0
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

cartSchema.pre('save', async function(next) {
  const itemPromises = this.items.map(async item => {
    const product = await this.model('Product').findById(item.product)
    item.product = product
    return item
  })

  this.items = await Promise.all(itemPromises)

  this.subTotal = this.items.reduce((total, item) => {
    return total + (item.product.price * item.quantity)
  }, 0)

  next()
})

cartSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  })
  next()
})


cartSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'items.product',
    select: 'name image summary price weight amount farm'
  })
  next()
})

const Cart = mongoose.model('Cart', cartSchema)

module.exports = Cart
