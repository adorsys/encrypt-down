const test = require('tape')
const tempy = require('tempy')
const suite = require('abstract-leveldown/test')
const leveldown = require('leveldown')
const jwk = require('../jwk.json')
const EncryptDown = require('../../src')

suite({
  test: test,
  factory: function () {
    return new EncryptDown(leveldown(tempy.directory()), { jwk })
  }
})
