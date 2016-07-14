'use strict'

var path = require('path')
var fs = require('fs')

try {
  exports.privateKey = fs.readFileSync(
    path.join(__dirname, process.env.SSL_KEY_PATH), 'utf8').toString()
  exports.certificate = fs.readFileSync(
    path.join(__dirname, process.env.SSL_CERT_PATH), 'utf8').toString()
} catch(e){
  exports.privateKey = null
  exports.certificate = null
}

