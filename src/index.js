'use strict'

// based on https://github.com/Level/encoding-down/blob/master/index.js

const AbstractLevelDOWN = require('abstract-leveldown').AbstractLevelDOWN
const AbstractChainedBatch = require('abstract-leveldown').AbstractChainedBatch
const AbstractIterator = require('abstract-leveldown').AbstractIterator
const inherits = require('inherits')
const jwe = require('@adorsys/jwe-codec')

const { JWK } = require('node-jose')

const EncodingError = require('level-errors').EncodingError

module.exports = DB.default = DB

function DB (db, opts) {
  if (!(this instanceof DB)) return new DB(db, opts)

  const manifest = db.supports || {}
  AbstractLevelDOWN.call(this, manifest)

  opts = opts || {}
  if (typeof opts.jwk === 'undefined') {
    throw new Error('EncryptDown: a JsonWebKey is required!')
  }

  this.keystorePromise = JWK.asKeyStore([].concat(opts.jwk))
  this.db = db
}

inherits(DB, AbstractLevelDOWN)
DB.prototype.type = 'encrypt-down'

DB.prototype._serializeKey =
DB.prototype._serializeValue = function (value) {
  return value
}

DB.prototype._open = function (opts, cb) {
  this.keystorePromise
    .then(ks => {
      const key = ks.get({ use: 'enc' })
      return jwe(key.toJSON(true))
    })
    .then(codec => {
      this.codec = codec
      return this.db.open(opts, cb)
    })
    .catch(error => {
      return cb(error)
    })
}

DB.prototype._close = function (cb) {
  this.db.close(cb)
}

DB.prototype._put = function (key, value, opts, cb) {
  return this.codec
    .encrypt(value)
    .then(cipher => {
      this.db.put(key, cipher, opts, cb)
    })
    .catch(cb)
}

DB.prototype._get = function (key, opts, cb) {
  this.db.get(key, Object.assign({}, opts, { asBuffer: false }), (err, cipher) => {
    if (err) {
      return cb(err)
    }
    this.codec
      .decrypt(cipher)
      .then(function (value) {
        cb(null, opts.asBuffer ? Buffer.from(String(value)) : value)
      })
      .catch(cb)
  })
}

DB.prototype._del = function (key, opts, cb) {
  this.db.del(key, opts, cb)
}

DB.prototype._chainedBatch = function () {
  return new Batch(this)
}

DB.prototype._batch = function (ops, opts, cb) {
  Promise.all(
    ops.map(op => {
      switch (op.type) {
        case 'put':
          return encryptOperationValue(this.codec, op)
        default:
          return Promise.resolve(op)
      }
    })
  ).then(_ops => {
    this.db.batch(_ops, opts, cb)
  })
}

DB.prototype._iterator = function (opts) {
  return new Iterator(this, opts)
}

function Iterator (db, opts) {
  AbstractIterator.call(this, db)
  this.codec = db.codec
  this.keys = opts.keys
  this.values = opts.values
  this.opts = opts
  this.it = db.db.iterator(Object.assign({}, this.opts, { valueAsBuffer: false }))
}

inherits(Iterator, AbstractIterator)

Iterator.prototype._next = function (cb) {
  this.it.next((err, key, cipher) => {
    if (err) {
      return cb(err)
    }
    if (key === undefined && cipher === undefined) {
      return cb()
    }
    this.codec
      .decrypt(cipher)
      .then(value => {
        cb(null, key, this.opts.valueAsBuffer ? Buffer.from(String(value)) : value)
      })
      .catch(err => cb(new EncodingError(err)))
  })
}

Iterator.prototype._seek = function (key) {
  this.it.seek(key)
}

Iterator.prototype._end = function (cb) {
  this.it.end(cb)
}

function Batch (db, codec) {
  AbstractChainedBatch.call(this, db)
  this.codec = db.codec
  this.batch = db.db.batch()
}

inherits(Batch, AbstractChainedBatch)

Batch.prototype._put = function (key, value) {
  return this.codec
    .encrypt(value)
    .then(cipher => {
      this.batch.put(key, cipher)
    })
}

Batch.prototype._del = function (key) {
  this.batch.del(key)
}

Batch.prototype._clear = function () {
  this.batch.clear()
}

Batch.prototype._write = function (opts, cb) {
  this.batch.write(opts, cb)
}

function encryptOperationValue (codec, operation) {
  return codec.encrypt(operation.value).then(function (cipher) {
    return Object.assign({}, operation, { value: cipher })
  })
}
