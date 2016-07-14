module.exports = function enableAuthentication(server) {
  'use strict'
  const log = require('debug')('boot:authentication')
  log('enable authentication')

  // enable authentication
  server.enableAuth()
}
