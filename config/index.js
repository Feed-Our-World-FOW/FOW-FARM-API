const Cloud = require('@google-cloud/storage')
const path = require('path')
// const serviceKey = path.join(__dirname, './fow-farm-16f1be2a6edc.json')
const serviceKey = path.join('/etc/secrets/fow-farm-16f1be2a6edc.json')

const { Storage } = Cloud
const storage = new Storage({
  keyFilename: serviceKey,
  projectId: 'fow-farm',
})

module.exports = storage