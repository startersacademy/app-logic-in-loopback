'use strict';

module.exports = {
  'db': {
    'name': 'db',
    'connector': 'mongodb',
    'host': process.env.DB_HOST,
    'port': process.env.DB_PORT,
    'database': process.env.DB_NAME,
    'username': process.env.DB_USER,
    'password': process.env.DB_PASSWORD,
    'user': process.env.DB_USER
  },
  'memory': {
    'name': 'memory',
    'connector': 'memory'
  },
  'memoryWithFile': {
    'name': 'memory',
    'connector': 'memory',
    'file': './data/data.json'
  }
}
