const Cloud = require('@google-cloud/storage')
const path = require('path')

// const serviceKey = path.join(__dirname, './circular-cubist-386109-144305c79418.json')
const serviceKey = path.join('/etc/secrets/circular-cubist-386109-144305c79418.json')

const { Storage } = Cloud
const storage = new Storage({
  keyFilename: serviceKey,
  projectId: 'circular-cubist-386109',
})

module.exports = storage