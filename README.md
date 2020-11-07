# :closed_lock_with_key: encrypt-down :closed_lock_with_key:
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

[![leveldb](https://leveljs.org/img/badge.svg)](https://github.com/level/awesome)
[![Travis](https://img.shields.io/travis/adorsys/encrypt-down.svg)](https://travis-ci.org/adorsys/encrypt-down)
[![Coveralls](https://img.shields.io/coveralls/adorsys/encrypt-down.svg)](https://coveralls.io/github/adorsys/encrypt-down)
[![npm](https://img.shields.io/npm/v/@adorsys/encrypt-down.svg)](https://www.npmjs.com/package/@adorsys/encrypt-down)
[![npm](https://img.shields.io/npm/dt/@adorsys/encrypt-down.svg)](https://www.npmjs.com/package/@adorsys/encrypt-down)
[![Conventional Commits](https://img.shields.io/badge/Conventional_Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier#readme)
[![NpmLicense](https://img.shields.io/npm/l/@adorsys/encrypt-down.svg)](https://github.com/adorsys/encrypt-down/blob/master/LICENSE)

encrypt-down is an encryption layer for LevelDB. 

For LevelDB exist several persistence bindings. 
Amongst others bindings for [IndexedDB](https://developer.mozilla.org/de/docs/IndexedDB).

By using encrypt-down it is possible to store lots (several MB) of sensitive user data securely (encrypted) in the browser across user sessions.

### Installation

```bash
npm install @adorsys/encrypt-down
```

### Usage

We need a JSON Web Key (JWK) or JSON Web Key Set (JWKS) as specified by [RFC 7517](https://tools.ietf.org/html/rfc7517).

```js
const memdown = require('memdown')
const encryptdown = require('@adorsys/encrypt-down')
const levelup = require('levelup')
const jwk = {
  kty: 'oct',
  alg: 'A256GCM',
  use: 'enc',
  k: '123456789abcdefghijklmnopqrstuvwxyz12345678'
}
const memdb = memdown()
const db = levelup(encryptdown(memdb, { jwk }))

db.put('key', { awesome: true }, function (err) {
  memdb._get('key', { asBuffer: false }, function (err, value) {
        console.log(value)
        // eyJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIiwia2lkIjoialpESEVqN0ZhR3N5OHNUSUZLRWlnejB4TjFEVWlBZWp0S1ZNcEl2Z3dqOCJ9..LLeRPtRCpn-Zie6-.zZc0LQ_vvHCppRAaC5fxw4yJ0041l6mGOSgLDVnaPagSv_3Khp8a8lyAo9utHQKpVX6RNVaVPBQQxJpkw_Zyljeg7L-O_Nc3N2Hi_904qE6_zwORqQRc.R0JhfgTHIcD_93kXzZ8BrA
  })
  db.get('key', { asBuffer: false }, function (err, value) {
    console.log(value) 
    // { awesome: true }
  })
})
```

### Browser Support

[![Sauce Test Status](https://saucelabs.com/browser-matrix/adorsysbot.svg)](https://saucelabs.com/u/adorsysbot)

## API

### `const db = require('@adorsys/encrypt-down')(db[, options])`

-   `db` must be an [`abstract-leveldown`](https://github.com/level/abstract-leveldown) compliant store
-   `options`:
    -   `jwk`: a JSON Web Key (JWK) or JSON Web Key Set (JWKS) as specified by [RFC 7517](https://tools.ietf.org/html/rfc7517)

## Credits

Made with :heart: by [radzom](https://github.com/radzom) and all these wonderful contributors ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://vincentweevers.nl/"><img src="https://avatars2.githubusercontent.com/u/3055345?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Vincent Weevers</b></sub></a><br /><a href="#question-vweevers" title="Answering Questions">💬</a></td>
    <td align="center"><a href="https://github.com/francis-pouatcha"><img src="https://avatars1.githubusercontent.com/u/1225651?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Francis Pouatcha</b></sub></a><br /><a href="#ideas-francis-pouatcha" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/borisskert"><img src="https://avatars1.githubusercontent.com/u/25199775?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Boris Skert</b></sub></a><br /><a href="https://github.com/adorsys/encrypt-down/commits?author=borisskert" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/jkroepke"><img src="https://avatars3.githubusercontent.com/u/1560587?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jan-Otto Kröpke</b></sub></a><br /><a href="#maintenance-jkroepke" title="Maintenance">🚧</a> <a href="#infra-jkroepke" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind are welcome!

## Big Thanks

Cross-browser Testing Platform and Open Source ♥ Provided by [Sauce Labs](https://saucelabs.com).

[![Sauce Labs logo](./Sauce-Labs.png)](https://saucelabs.com)

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
