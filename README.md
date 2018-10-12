# :closed_lock_with_key: encrypt-down :closed_lock_with_key:

[![leveldb](http://leveldb.org/img/badge.svg)](https://github.com/level/awesome)
[![Travis](https://img.shields.io/travis/adorsys/encrypt-down.svg)](https://travis-ci.org/adorsys/encrypt-down)
[![Coveralls](https://img.shields.io/coveralls/adorsys/encrypt-down.svg)](https://coveralls.io/github/adorsys/encrypt-down)
[![npm](https://img.shields.io/npm/v/@adorsys/encrypt-down.svg)](https://www.npmjs.com/package/@adorsys/encrypt-down)
[![npm](https://img.shields.io/npm/dt/@adorsys/encrypt-down.svg)](https://www.npmjs.com/package/@adorsys/encrypt-down)
[![Conventional Commits](https://img.shields.io/badge/Conventional_Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier#readme)
[![NpmLicense](https://img.shields.io/npm/l/encrypt-down.svg)](https://github.com/adorsys/encrypt-down/blob/master/LICENSE)

An abstract-leveldown implementation that wraps another store to encrypt values.

### Installation

```bash
npm install @adorsys/encrypt-down
```

### Usage

Without any options `encrypt-down` can be used but nothing is encrypted.
```js
const memdown = require('memdown')
const encryptdown = require('@adorsys/encrypt-down')
const levleup = require('levelup')

const db = levelup(encryptdown(memdown()))

db.put('key', { awesome: true }, function (err) {
  db.get('key', function (err, value) {
    console.log(value) // { awesome: true }
  })
})
```

Can we specify the encryption that shall be used? Yes!
```js
const memdown = require('memdown')
const encryptdown = require('@adorsys/encrypt-down')
const levleup = require('levelup')

// WARNING: do not use this codec in production it is NOT ENCRYPTING
const codec = {
  encrypt: value => Promise.resolve(value),
  decrypt: value => Promise.resolve(value)
}
const db = levelup(encryptdown(memdown(), { codec }))

db.put('key', { awesome: true }, function (err) {
  db.get('key', function (err, value) {
    console.log(value) // { awesome: true }
  })
})
```

Is there an example that actually encrypts the values? Yes!
We can use an existing encryption library like [`jwe-codec`](https://github.com/adorsys/jwe-codec).
```js
const memdown = require('memdown')
const encryptdown = require('@adorsys/encrypt-down')
const levleup = require('levelup')
const jwe = require('@adorsys/jwe-codec')
const key = {
  kty: 'oct',
  alg: 'A256GCM',
  use: 'enc',
  k: '123456789abcdefghijklmnopqrstuvwxyz12345678'
}

jwe(key).then(function(codec) {
  const db = levelup(encryptdown(memdown(), { codec }))

  db.put('key', { awesome: true }, function (err) {
    db.get('key', function (err, value) {
      console.log(value) // { awesome: true }
    })
  })
})
```

## API

### `const db = require('@adorsys/encrypt-down')(db[, options])`

-   `db` must be an [`abstract-leveldown`](https://github.com/level/abstract-leveldown) compliant store
-   `options`:
    -   `codec`:
        -   `encrypt`: function returning promise of encrypted value 
        -   `decrypt`: function returning promise of decrypted value

`encrypt` and `decrypt` both default to identity function when not explicitly specified.

## Credits

Made with :heart: by [radzom](https://github.com/radzom) and all these wonderful contributors ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| <img src="https://avatars.githubusercontent.com/u/3055345?v=3" width="100px;"/><br /><sub><b>Vincent Weevers</b></sub><br />:speech_balloon: | | | | | | |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind are welcome!
