const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    items: [
      {
        stockProduct: {
          type: mongoose.Schema.ObjectId,
          ref: 'StockProduct'
        },
        ondemandProduct: {
          type: mongoose.Schema.ObjectId,
          ref: 'OndemandProduct'
        },
        orderQuantity: {
          type: Number,
          default: 0
        },
        orderUnit: {
          type: String,
          enum: ['lb', 'kg', 'oz']
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
    const stockProduct = await this.model('StockProduct').findById(item.stockProduct)
    const ondemandProduct = await this.model('OndemandProduct').findById(item.ondemandProduct)

    if(stockProduct) {
      item.stockProduct = stockProduct
    } else if(ondemandProduct) {
      item.ondemandProduct = ondemandProduct
    }

    return item
  })

  this.items = await Promise.all(itemPromises)

  this.subTotal = this.items.reduce((total, item) => {
    if(item.stockProduct) {
      
      if(item.stockProduct.unit === "oz") {
        if(item.orderUnit === "kg") {
          return total + (item.stockProduct.price * 0.0283495231 * item.orderQuantity)
        }
        else if(item.orderUnit === "lb") {
          return total + (item.stockProduct.price * 0.0625 * item.orderQuantity)
        }
      } else if(item.stockProduct.unit === "lb") {
        if(item.orderUnit === "kg") {
          return total + (item.stockProduct.price * 0.45359237 * item.orderQuantity)
        }
        else if(item.orderUnit === "oz") {
          return total + (item.stockProduct.price * 15.9999995 * item.orderQuantity)
        }
      } else if(item.stockProduct.unit === "kg") {
        if(item.orderUnit === "lb") {
          return total + (item.stockProduct.price * 2.20462262 * item.orderQuantity)
        }
        else if(item.orderUnit === "oz") {
          return total + (item.stockProduct.price * 35.2739619 * item.orderQuantity)
        }
      }

      
    } else if(item.ondemandProduct) {

      if(item.ondemandProduct.unit === "oz") {
        if(item.orderUnit === "kg") {
          return total + (item.ondemandProduct.price * 0.0283495231 * item.orderQuantity)
        }
        else if(item.orderUnit === "lb") {
          return total + (item.ondemandProduct.price * 0.0625 * item.orderQuantity)
        }
      } else if(item.ondemandProduct.unit === "lb") {
        if(item.orderUnit === "kg") {
          return total + (item.ondemandProduct.price * 0.45359237 * item.orderQuantity)
        }
        else if(item.orderUnit === "oz") {
          return total + (item.ondemandProduct.price * 15.9999995 * item.orderQuantity)
        }
      } else if(item.ondemandProduct.unit === "kg") {
        if(item.orderUnit === "lb") {
          return total + (item.ondemandProduct.price * 2.20462262 * item.orderQuantity)
        }
        else if(item.orderUnit === "oz") {
          return total + (item.ondemandProduct.price * 35.2739619 * item.orderQuantity)
        }
      }
    }
  }, 0)

  next()
})


cartSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  })

  next()
})

cartSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'items.stockProduct',
    select: 'businessProfile product name image unit price -producer'
  })
  next()
})

cartSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'items.ondemandProduct',
    select: 'businessProfile product name image unit price -producer'
  })
  next()
})

const Cart = mongoose.model('Cart', cartSchema)

module.exports = Cart
