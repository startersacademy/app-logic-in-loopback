'use strict'

const loopback = require('loopback')
const http = require('http')
const https = require('https')
const _ = require('underscore')
const log = require('debug')('server')

const app = module.exports = loopback()

/**
 * Handles command line arguments and environment variables used to start
 * the app server
 *
 * @param options Options used override defaults
 */
function getOptions(options){
  // TODO: move to argv module that provides documentation
  const argv = require('minimist')(process.argv.slice(2))

  if (options === undefined) options = {}

  // Handle common runtime overrides
  const cliOptions = {
    port: argv.p,
    appName: argv.n,
    collectStats: argv['collect-stats'],
    maxListeners: argv['max-listeners']
  }

  // Handle environment variables
  const environmentOptions = {
    port: process.env.PORT,
    appName: process.env.APP_NAME,
    collectStats: process.env.COLLECT_STATS,
    maxListeners: process.env.MAX_LISTENERS,
    protocol: process.env.PROTOCOL
  }

  // Make sure necessary options are in place
  const defaultOptions = {
    port: 3000,
    collectStats: false,
    protocol: 'http'
  }

  _.defaults(options, cliOptions, environmentOptions, defaultOptions)

  // Make sure types are valid
  options.port = Number(options.port)
  options.maxListeners = Number(options.maxListeners)

  return options
}
function pluginsReady(){
  log('PLUGINS READY')
  app.emit('plugins ready')
  app.emit('start')
}
function loadPlugins() {
  log('load plugins')
  if (typeof app.loadPlugins === 'function') {
    app.loadPlugins(function(err){
      if (err) return console.error(err)
      if (app.services && app.services.pluginStarter){
        app.services.pluginStarter.start(pluginsReady)
      } else {
        pluginsReady();
      }
    })
  } else {
    pluginsReady();
  }
}
function getBaseUrl() {
  const protocol = app.settings.boot.protocol
  return protocol + '://' + app.get('host') + ':' + app.get('port')
}
function triggerStarted(){
  if (require.main === module) {
    log('in app server mode')
    app.start()
  } else {
    log('in socket server mode')
    app.emit('started', getBaseUrl())
  }
}
function onStarted(baseUrl){
  log('Web server listening at: %s', baseUrl)
  log('Get server status at: %s%s', baseUrl, '/status')
  if (app.get('loopback-component-explorer')) {
    const explorerPath = app.get('loopback-component-explorer').mountPath
    log('Browse the REST API at %s%s', baseUrl, explorerPath)
  }
}

// Set up listeners
app.on('start', function (){
  app.emit('ready', 'app')
})
app.on('ready', function(component){
  if (component === 'database'){
    log('DATABASE READY')
    loadPlugins()
  }
  if (component === 'app'){
    log('APP SERVER READY')
    triggerStarted()
  }
})
app.on('started', onStarted)

/**
 * Allows another module to set boot options before configuring models,
 * datasources, middleware, and plugins and starting the server
 *
 * @param options Options used during the boot process
 */
app.boot = function bootServer(options){
  log('boot')
  const boot = require('loopback-boot')

  // Pass boot options to app to allow it to set additional app properties
  // as necessary
  app.set('boot', getOptions(options))

  boot(app, __dirname)
}


/***
 * Starts HTTP server
 */
app.start = function startServer(){
  log('start')
  let server = null
  const protocol = app.settings.boot.protocol

  if (protocol === 'https') {
    const sslConfig = require('./ssl-config')
    const sslOptions = {
      key: sslConfig.privateKey,
      cert: sslConfig.certificate
    }
    if (sslOptions.key === null || sslOptions.cert === null){
      console.error('missing key or cert--could not create https server')
    } else {
      log('creating https server')
      server = https.createServer(sslOptions, app)
      app.close = server.close
    }
  } else {
    server = http.createServer(app)
    app.close = server.close
  }
  server.listen(app.get('port'), function(){
    const baseUrl = protocol + '://' + app.get('host') + ':' + app.get('port')
    app.emit('started', baseUrl)
  })
  return server
}


// start the server if `$ node server.js`
// otherwise, the calling module should call app.boot()
if (require.main === module) {
  app.boot()
  //app.emit('start')
}
