const mongoose = require('mongoose')
const slugify = require('slugify')

const farmSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    trim: true,
    required: [true, 'A farm must have a name'],
    maxlength: [40, 'A farm must have less then or equal then 40 characters'],
    minlength: [10, 'A farm must have greater then or equal then 10 characters']
  },
  slug: String,
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'rating must be greater then or equal then 1.0'],
    max: [5, 'rating must be less then or equal then 5.0'],
    set: val => Math.round(val * 10) / 10
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  "summery": {
    type: String,
    trim: true,
    required: [true, 'A farm must have a summery']
  },
  // owner: {
  //   type: mongoose.Schema.ObjectId,
  //   ref: 'User',
  //   required: [true, 'Farm must belongs to a business account']
  // },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'A farm must have a description']
  },
  imageCover: {
    type: String
  },
  images: String,
  secretFarm: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  meat: {
    type: Boolean,
    default: false
  },
  produce: {
    type: Boolean,
    default: false
  }

},{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

farmSchema.index({ ratingsAverage: -1 })
farmSchema.index({ slug: 1 })
farmSchema.index({ location: '2dsphere' })

farmSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true })
  next()
})

farmSchema.pre(/^find/, function(next) {
  this.find({ secretFarm: { $ne: true } })
  next()
})

// Not going to polute the getAllFarm screen------
// farmSchema.pre(/^find/, function(next) {
//   this.populate({
//     path: 'reviews'
//   })
//   next()
// })

// farmSchema.pre(/^find/, function(next) {
//   this.populate({
//     path: 'allMeats'
//   })
//   next()
// })

// Virtual populate
farmSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'farm',
  localField: '_id'
})

farmSchema.virtual('allMeats', {
  ref: 'Meat',
  foreignField: 'farm',
  localField: '_id'
})

farmSchema.virtual('allProduce', {
  ref: 'Produce',
  foreignField: 'farm',
  localField: '_id'
})

farmSchema.virtual('allProduct', {
  ref: 'Product',
  foreignField: 'farm',
  localField: '_id'
})

const Farm = mongoose.model('Farm', farmSchema)

module.exports = Farm

