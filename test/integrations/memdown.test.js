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

  // Opt-in to new clear() tests
  clear: true,

  // Opt-out of unsupported features
  createIfMissing: false,
  errorIfExists: false
})
