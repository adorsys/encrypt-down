'use strict'

const AbstractLevelDOWN = require('abstract-leveldown').AbstractLevelDOWN
const AbstractIterator = require('abstract-leveldown').AbstractIterator
const jose = require('node-jose')
const jwe = require('@adorsys/jwe-codec')
const inherits = require('inherits')

module.exports = DB.default = DB

function DB (db, options) {
  if (!(this instanceof DB)) {
    return new DB(db, options)
  }
  AbstractLevelDOWN.call(this)

  options = options || {}
  if (typeof options.jwk === 'undefined') {
    throw new Error('EncryptDown: a JsonWebKey is required!')
  }
  const jwks = [].concat(options.jwk)
  this.keystorePromise = jose.JWK.asKeyStore(jwks)
  this.db = db
}

inherits(DB, AbstractLevelDOWN)

DB.prototype._serializeKey = function (key) {
  return key
}

DB.prototype._serializeValue = function (value) {
  return value
}

DB.prototype._open = function (options, callback) {
  this.keystorePromise
    .then(ks => {
      const key = ks.get({ use: 'enc' })
      return jwe(key.toJSON(true))
    })
    .then(codec => {
      this.codec = codec
      return this.db.open(options, callback)
    })
    .catch(error => {
      return callback(error)
    })
}

DB.prototype._close = function (callback) {
  this.db.close(callback)
}

DB.prototype._put = function (key, value, options, callback) {
  return this.codec
    .encrypt(value)
    .then(cipher => {
      this.db.put(key, cipher, options, callback)
    })
    .catch(callback)
}

DB.prototype._get = function (key, options, callback) {
  this.db.get(key, { ...options, asBuffer: false }, (err, cipher) => {
    if (err) {
      return callback(err)
    }
    this.codec
      .decrypt(cipher)
      .then(function (value) {
        const checkedValue = emptyStringWhenNull(value)
        callback(
          null,
          options.asBuffer ? Buffer.from(String(checkedValue)) : checkedValue
        )
      })
      .catch(callback)
  })
}

DB.prototype._del = function (key, options, callback) {
  this.db.del(key, options, callback)
}

DB.prototype._batch = function (ops, options, callback) {
  Promise.all(
    ops.map(op => {
      switch (op.type) {
        case 'put':
          return encryptOperationValue(this.codec, op)
        default:
          return Promise.resolve(op)
      }
    })
  ).then(operations => {
    this.db._batch(operations, options, callback)
  })
}

DB.prototype._iterator = function (options) {
  return new Iterator(this, options)
}

function Iterator (db, options) {
  AbstractIterator.call(this, db)
  this.codec = db.codec
  this.keys = options.keys
  this.values = options.values
  this.options = options
  this.it = db.db.iterator({ ...this.options, valueAsBuffer: false })
}

inherits(Iterator, AbstractIterator)

Iterator.prototype._next = function (callback) {
  this.it.next((err, key, cipher) => {
    if (err) {
      return callback(err)
    }
    if (key === undefined && cipher === undefined) {
      return callback()
    }
    this.codec
      .decrypt(cipher)
      .then(value => {
        callback(
          null,
          key,
          this.options.valueAsBuffer ? Buffer.from(String(value)) : value
        )
      })
      .catch(callback)
  })
}

Iterator.prototype._end = function (callback) {
  this.it.end(callback)
}

function emptyStringWhenNull (value) {
  return value === null ? '' : value
}

function encryptOperationValue (codec, operation) {
  return codec.encrypt(operation.value).then(function (cipher) {
    return { ...operation, value: cipher }
  })
}
