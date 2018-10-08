function promisedIdentity (value) {
  Promise.resolve(value)
}

const codec = {
  encrypt: promisedIdentity,
  decrypt: promisedIdentity
}

module.exports = codec
