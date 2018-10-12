const test = require('tape')
const testCommon = require('abstract-leveldown/testCommon')
const leveljs = require('level-js')
const EncryptDown = require('../../src')
const jwe = require('@adorsys/jwe-codec')
const key = require('../key.json')
;(async () => {
  const codec = await jwe(key)
  const factory = location => new EncryptDown(leveljs(location), { codec })

  /** compatibility with basic LevelDOWN API **/
  test('integration with leveldown', t => {
    require('abstract-leveldown/abstract/leveldown-test').args(factory, test)
    require('abstract-leveldown/abstract/open-test').open(
      factory,
      t.test,
      testCommon
    )
    require('abstract-leveldown/abstract/del-test').all(factory, t.test)
    require('abstract-leveldown/abstract/get-test').all(factory, t.test)
    require('abstract-leveldown/abstract/put-test').all(factory, t.test)
    require('abstract-leveldown/abstract/put-get-del-test').all(factory, t.test)
    require('abstract-leveldown/abstract/batch-test').all(factory, t.test)
    require('abstract-leveldown/abstract/chained-batch-test').all(
      factory,
      t.test
    )
    require('abstract-leveldown/abstract/close-test').close(factory, t.test)
    require('abstract-leveldown/abstract/iterator-test').all(factory, t.test)
    require('abstract-leveldown/abstract/iterator-range-test').all(
      factory,
      t.test
    )
  })
})()
