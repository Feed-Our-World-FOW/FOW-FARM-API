const mongoose = require('mongoose')
const convert = require('convert-units')

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
        },
        orderTotal: {
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
          return total + ((item.stockProduct.price / convert(1).from('oz').to('kg')) * item.orderQuantity)
        }
        else if(item.orderUnit === "lb") {
          return total + ((item.stockProduct.price / convert(1).from('oz').to('lb')) * item.orderQuantity)
        }
        else {
          return total + (item.stockProduct.price * item.orderQuantity)
        }
      } else if(item.stockProduct.unit === "lb") {
        if(item.orderUnit === "kg") {
          return total + ((item.stockProduct.price / convert(1).from('lb').to('kg')) * item.orderQuantity)
        }
        else if(item.orderUnit === "oz") {
          return total + ((item.stockProduct.price / convert(1).from('lb').to('oz')) * item.orderQuantity)
        }
        else {
          return total + (item.stockProduct.price * item.orderQuantity)
        }
      } else if(item.stockProduct.unit === "kg") {
        if(item.orderUnit === "lb") {
          return total + ((item.stockProduct.price / convert(1).from('kg').to('lb')) * item.orderQuantity)
        }
        else if(item.orderUnit === "oz") {
          return total + ((item.stockProduct.price / convert(1).from('kg').to('oz')) * item.orderQuantity)
        }
        else {
          return total + (item.stockProduct.price * item.orderQuantity)
        }
      }

      
    } else if(item.ondemandProduct) {

      if(item.ondemandProduct.unit === "oz") {
        if(item.orderUnit === "kg") {
          return total + ((item.ondemandProduct.price / convert(1).from('oz').to('kg')) * item.orderQuantity)
        }
        else if(item.orderUnit === "lb") {
          return total + ((item.ondemandProduct.price / convert(1).from('oz').to('lb')) * item.orderQuantity)
        }
        else {
          return total + (item.ondemandProduct.price * item.orderQuantity)
        }
      } else if(item.ondemandProduct.unit === "lb") {
        if(item.orderUnit === "kg") {
          return total + ((item.ondemandProduct.price / convert(1).from('lb').to('kg')) * item.orderQuantity)
        }
        else if(item.orderUnit === "oz") {
          return total + ((item.ondemandProduct.price / convert(1).from('lb').to('oz')) * item.orderQuantity)
        }
        else {
          return total + (item.ondemandProduct.price * item.orderQuantity)
        }
      } else if(item.ondemandProduct.unit === "kg") {
        if(item.orderUnit === "lb") {
          return total + ((item.ondemandProduct.price / convert(1).from('kg').to('lb')) * item.orderQuantity)
        }
        else if(item.orderUnit === "oz") {
          return total + ((item.ondemandProduct.price / convert(1).from('kg').to('oz')) * item.orderQuantity)
        }
        else {
          return total + (item.ondemandProduct.price * item.orderQuantity)
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
