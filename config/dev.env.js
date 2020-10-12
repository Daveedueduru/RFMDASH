'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  API: '"http://dashTestTomcat:8181"' 
})

//http://10.206.156.153:8080 //PROD Just Historical
//http://dashdlddc02-prod:8080 //PROD Live With Historical 
//http://dashTestTomcat:8181 //TEST Env