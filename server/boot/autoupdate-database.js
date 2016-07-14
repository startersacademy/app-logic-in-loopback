'use strict'

module.exports = function(app) {

  var ds = app.datasources.db

  function update(){
    ds.autoupdate(function(err){
      if (err) {
        console.error('problem creating or updating tables', err)
        //throw err
      }
      console.log('created or updated tables')
      app.emit('ready', 'database')
    })
  }

  if(ds.connected) {
    update()
  } else {
    ds.once('connected', update)
  }

  return app
}

