const test = require('tape')
const cuid = require('cuid')
const suite = require('abstract-leveldown/test')
const leveljs = require('level-js')
const jwk = require('../jwk.json')
const EncryptDown = require('../../src')

suite({
  test: test,
  factory: function () {
    return new EncryptDown(leveljs(cuid()), { jwk })
  },
  seek: false,
  createIfMissing: false,
  errorIfExists: false
})
