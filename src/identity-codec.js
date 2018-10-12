async function promisedIdentity (value) {
  return value
}

const codec = {
  encrypt: promisedIdentity,
  decrypt: promisedIdentity
}

module.exports = codec
