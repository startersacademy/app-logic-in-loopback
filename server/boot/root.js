module.exports = function(app) {
  'use strict'
  const log = require('debug')('boot:root')
  log('show status at /')

  const pkg = require('../../package')
  const started = new Date()

  // Install a `/` route that returns server status
  app.get('/', function(req, res) {
    res.json({
      app: pkg.name,
      version: pkg.version,
      env: process.env.NODE_ENV,
      apiUrl: app.get('restApiRoot'),
      started: started,
      uptime: (Date.now() - Number(started)) / 1000
    })
  })
}
