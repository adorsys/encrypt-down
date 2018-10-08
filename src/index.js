'use strict'

const AbstractLevelDOWN = require('abstract-leveldown').AbstractLevelDOWN
const AbstractIterator = require('abstract-leveldown').AbstractIterator
const inherits = require('inherits')
const IdentityCodec = require('./identity-codec')

module.exports = DB.default = DB

function DB (db, options) {
  if (!(this instanceof DB)) {
    return new DB(db, options)
  }
  AbstractLevelDOWN.call(this, '')

  options = options || {}
  if (typeof options.codec === 'undefined') {
    options.codec = IdentityCodec
  }

  this.db = db
  this.codec = options.codec
}

inherits(DB, AbstractLevelDOWN)

DB.prototype._serializeKey = function (key) {
  return key
}

DB.prototype._serializeValue = function (value) {
  return value
}

DB.prototype._open = function (options, callback) {
  this.db.open(options, callback)
}

DB.prototype._close = function (callback) {
  this.db.close(callback)
}

DB.prototype._put = function (key, value, options, callback) {
  const self = this
  return this.codec
    .encrypt(value)
    .then(function (cipher) {
      self.db.put(key, cipher, options, callback)
    })
    .catch(callback)
}

DB.prototype._get = function (key, options, callback) {
  const self = this
  self.db.get(key, { ...options, asBuffer: false }, function (err, cipher) {
    if (err) {
      return callback(err)
    }
    self.codec
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
  const self = this
  Promise.all(
    ops.map(op => {
      switch (op.type) {
        case 'put':
          return encryptOperationValue(self.codec, op)
        default:
          return Promise.resolve(op)
      }
    })
  ).then(function (operations) {
    self.db._batch(operations, options, callback)
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
  const self = this
  self.it.next(function (err, key, cipher) {
    if (err) {
      return callback(err)
    }
    if (key === undefined && cipher === undefined) {
      return callback()
    }
    self.codec
      .decrypt(cipher)
      .then(function (value) {
        callback(
          null,
          key,
          self.options.valueAsBuffer ? Buffer.from(String(value)) : value
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
