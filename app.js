const express = require('express')
const morgan = require('morgan')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorControllers')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const farmRouter = require('./routes/farmRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
// const cartRouter = require('./routes/cartRoutes')
const productRouter = require('./routes/productRoute')
const productReviewRouter = require('./routes/reviewProductRoute')
const addressRouter = require('./routes/addressRoutes')

const businessProfileRouter = require('./routes/businessProfileRoute')
const consumerProfileRouter = require('./routes/consumerProfileRoutes')
const stockProductRouter = require('./routes/stockProductRoutes')
const ondemandProductRouter = require('./routes/ondemandProductRoutes')
const cartRouter = require('./routes/cartRoutes')
const buyRouter = require('./routes/buyRoutes')
const favouriteRouter = require('./routes/favouriteFarmRoutes')

const app = express()

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))

app.use(express.json())

app.use(helmet())

if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Limit request from same Id
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: `Too many request from this IP, please try again in an hour!`
// })

// app.use('/api', limiter)

app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())

// Data sanitization against NoSQL query injection
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())

// Prevent parameter pollution
app.use(hpp({
  whitelist: [
    'ratingsAverage',
    'ratingsQuantity'
  ]
}))

app.use((req, res, next) => {
  // console.log(req.cookies)
  console.log('🚓🚓🚙🚙')
  next()
})

app.use('/public', express.static('public'))

// app.use('/api/v1/farm', farmRouter)
app.use('/api/v1/user', userRouter)
app.use('/api/v1/reviews', reviewRouter)
// app.use('/api/v1/cart', cartRouter)
// app.use('/api/v1/addProduct', productRouter)
// app.use('/api/v1/reviewProduct', productReviewRouter)
// app.use('/api/v1/address', addressRouter)

app.use('/api/v1/business', businessProfileRouter)
app.use('/api/v1/consumer', consumerProfileRouter)
app.use('/api/v1/stockProduct', stockProductRouter)
app.use('/api/v1/ondemandProduct', ondemandProductRouter)
app.use('/api/v1/cart', cartRouter)
app.use('/api/v1/buy', buyRouter)
app.use('/api/v1/favourite', favouriteRouter)

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)

module.exports = app

