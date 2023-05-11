const util = require('util')
const gc = require('../config/index')
const catchAsync = require('./catchAsync')
const AppError = require('./appError')
const { format } = require('url')
const bucket = gc.bucket('fow-farm') // should be your bucket name

/**
 *
 * @param { File } object file object that will be uploaded
 * @description - This function does the following
 * - It uploads a file to the image bucket on Google Cloud
 * - It accepts an object as an argument with the
 *   "originalname" and "buffer" as keys
 */

exports.uploadImage = (file) => new Promise((resolve, reject) => {
  const { originalname, buffer } = file

  // console.log(file)

  const blob = bucket.file(originalname.replace(/ /g, "_"))
  const blobStream = blob.createWriteStream({
    resumable: false
  })

  blobStream
    .on('finish', () => {
      const publicUrl = format(
        `https://storage.googleapis.com/${bucket.name}/${blob.name}`
      )
      resolve(publicUrl)
    })
    .on('error', (err) => {
      console.error("err: ", err)
      reject(`Unable to upload image, something went wrong`)
    })
    .end(buffer)
})


// exports.uploadImage = (file) => new Promise((resolve, reject) => {
//   const { originalname, buffer } = file

//   console.log(file)

//   const blob = bucket.file(originalname.replace(/ /g, "_"))
//   const blobStream = blob.createWriteStream({
//     resumable: false
//   })
//   blobStream.on('finish', () => {
//     const publicUrl = format(
//       `https://storage.googleapis.com/${bucket.name}/${blob.name}`
//     )
//     resolve(publicUrl)
//   })
//   .on('error', () => {
//     reject(`Unable to upload image, something went wrong`)
//   })
//   .end(buffer)
// })