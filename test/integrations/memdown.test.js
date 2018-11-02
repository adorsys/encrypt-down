const test = require('tape')
const suite = require('abstract-leveldown/test')
const memdown = require('memdown')
const jwk = require('../jwk.json')
const EncryptDown = require('../../src')

suite({
  test: test,
  factory: function () {
    return new EncryptDown(memdown(), { jwk })
  },
  seek: false,
  createIfMissing: false,
  errorIfExists: false
})
