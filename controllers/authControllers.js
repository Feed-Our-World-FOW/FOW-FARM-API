const crypto = require('crypto')
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const User = require('../model/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const Email = require('../utils/email')

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id)

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  }

  if(process.env.NODE_ENV === 'production') cookieOptions.secure = true

  res.cookie('jwt', token, cookieOptions)

  // Remove the password from the output
  user.password = undefined

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  })
}

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body)

  const url = `${req.protocol}://${req.get('host')}/me`
  // console.log(url)

  if(req.body.role === "user") {
    await new Email(newUser, url).sendWelcomeToConsumer()
  } else if(req.body.role === "business") {

    await new Email(newUser, url).sendWelcomeToProducer()
  }


  createAndSendToken(newUser, 201, res)
})

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  if(!email || !password) {
    return next(new AppError(`Please provide email & password`, 404))
  }

  const user = await User.findOne({ email }).select('+password')

  if(!user || !await user.correctPassword(password, user.password)) {
    return next(new AppError(`Incorrect email or password`, 401))
  }

  createAndSendToken(user, 200, res)
})

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  })
  res.status(200).json({ status: 'success' })
}

exports.protect = catchAsync(async (req, res, next) => {
  let token

  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }else if(req.cookies.jwt) {
    token = req.cookies.jwt
  }
  if(!token) {
    return next(new AppError(`You aren't logged in! Please log in to get access`, 401))
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
  
  const freshUser = await User.findById(decoded.id)

  if(!freshUser) {
    return next(new AppError(`The user belonging to this token does no longer exist`, 401))
  }

  if(freshUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError(`User recently changed password! Please log in again`, 401))
  }

  req.user = freshUser

  next()
})

// Only for rendered pages, no errors
exports.isLoggedIn = async (req, res, next) => {

  try {
    if(req.cookies.jwt) {

      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)
      
      const freshUser = await User.findById(decoded.id)
      
      if(!freshUser) {
        return next()
      }
      
      if(freshUser.changedPasswordAfter(decoded.iat)) {
        return next()
      }
      
      res.locals.user = freshUser
      
      return next()
    }
  } catch (error) {
    return next()
  }
  next()
}

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if(!roles.includes(req.user.role)) {
      return next(new AppError(`You don't have permission to perform this action`, 403))
    }
    next()
  }
}

exports.forgotPassword = catchAsync(async(req, res, next) => {
  const user = await User.findOne({ email: req.body.email })

  if(!user) {
    return next(new AppError(`There is no user with that email address`, 404))
  }

  // Generate the random reset token
  const resetToken = user.createPasswordResetToken()

  await user.save({ validateBeforeSave: false })

  try {
    const resetURL = 
    `${req.protocol}://${req.get('host')}/api/v1/user/resetPassword/${resetToken}`
    await new Email(user, resetURL).sendPasswordReset()
  
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    })
  } catch (error) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })

    return next(
      new AppError(`There was an error sending this email, Try again later!`, 500)
    )
  }
  
})

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  })

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400))
  }
  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createAndSendToken(user, 200, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password')

  // 2) Check if POSTed current password is correct
  if(!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError(`Your current password is wrong`, 401))
  }

  // 3) If so, update password
  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  await user.save()

  // 4) log user in, send JWT token
  createAndSendToken(user, 200, res)
})

