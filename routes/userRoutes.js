const express = require('express')

const {
  createUser,
  getAllUser,
  getSingleUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto
} = require('../controllers/userControllers')

const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
  restrictTo
} = require('../controllers/authControllers')


const router = express.Router()

router
  .route('/signup')
    .post(signup)

router
  .route('/login')
    .post(login)

router
  .route('/logout')
    .get(logout)
    
router
  .route('/forgotPassword')
    .post(forgotPassword)

router
  .route('/resetPassword/:token')
    .patch(resetPassword)

router.use(protect)

router
  .route('/updateMyPassword')
    .patch(updatePassword)

router
  .route('/me')
    .get(getMe, getSingleUser)

router
  .route('/updateMe')
    .patch(uploadUserPhoto, resizeUserPhoto, updateMe)

router
  .route('/deleteMe')
    .delete(deleteMe)

router.use(restrictTo('admin'))

router
  .route('/')
    .get(getAllUser)
    .post(createUser)

router
  .route('/:id')
    .get(getSingleUser)
    .patch(updateUser)
    .delete(deleteUser)

module.exports = router
