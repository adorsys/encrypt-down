const test = require('ava')
const memdown = require('memdown')
const testCommon = require('abstract-leveldown/testCommon')
const ltgt = require('ltgt')
const jwe = require('@adorsys/jwe-codec')
const EncryptDown = require('../src')
const { stringBuffer, getKey, putKey, promisify } = require('./helper')
const key = require('./key.json')

test.beforeEach(async t => {
  const codec = await jwe(key)
  const db = new EncryptDown(memdown(), { codec })
  const promised = promisify(db)
  t.context.db = db
  t.context.promisedDB = {
    db: db,
    open: promised(db.open),
    close: promised(db.close),
    get: promised(db.get),
    put: promised(db.put),
    del: promised(db.del),
    batch: promised(db.batch)
  }
})

test.afterEach.cb(t => {
  t.context.db.close(err => {
    t.falsy(err)
    t.end()
  })
})

test.cb('null value', t => {
  ;(async () => {
    const promisedDB = t.context.promisedDB
    await promisedDB.open()
    await promisedDB.put('foo', null)
    const value1 = await promisedDB.get('foo')
    t.is(value1.toString(), '', 'nulls are equal')
    const value2 = await promisedDB.get('foo', { asBuffer: false })
    t.is(value2, '', 'nulls are equal')
    t.end()
    t.pass('ok')
  })()
})

test.cb('unsorted entry, sorted iterator', t => {
  ;(async () => {
    const promisedDB = t.context.promisedDB
    await promisedDB.open()
    await promisedDB.put('f', 'F')
    await promisedDB.put('a', 'A')
    await promisedDB.put('c', 'C')
    await promisedDB.put('e', 'E')
    await promisedDB.batch([
      { type: 'put', key: 'd', value: 'D' },
      { type: 'put', key: 'b', value: 'B' },
      { type: 'put', key: 'g', value: 'G' },
      { type: 'del', key: 'b' },
      { type: 'del', key: 'e' }
    ])
    testCommon.collectEntries(
      promisedDB.db.iterator({ keyAsBuffer: false, valueAsBuffer: false }),
      function (err, data) {
        t.falsy(err, 'no error')
        t.is(data.length, 5, 'correct number of entries')
        const expected = [
          { key: 'a', value: 'A' },
          { key: 'c', value: 'C' },
          { key: 'd', value: 'D' },
          { key: 'f', value: 'F' },
          { key: 'g', value: 'G' }
        ]
        t.deepEqual(data, expected)
        t.end()
      }
    )
  })()
})

test.cb('reading while putting', t => {
  ;(async () => {
    const promisedDB = t.context.promisedDB
    await promisedDB.open()
    await promisedDB.put('f', 'F')
    await promisedDB.put('c', 'C')
    await promisedDB.put('e', 'E')

    const iterator = promisedDB.db.iterator({
      keyAsBuffer: false,
      valueAsBuffer: false
    })
    iterator.next(function (err, key, value) {
      t.falsy(err, 'no next error')
      t.is(key, 'c')
      t.is(value, 'C')

      promisedDB.put('a', 'A')

      iterator.next(function (err, key, value) {
        t.falsy(err, 'no next error')
        t.is(key, 'e')
        t.is(value, 'E')
        t.end()
      })
    })
  })()
})

test.cb('reading while deleting', t => {
  ;(async () => {
    const promisedDB = t.context.promisedDB
    await promisedDB.open()
    await promisedDB.put('f', 'F')
    await promisedDB.put('a', 'A')
    await promisedDB.put('c', 'C')
    await promisedDB.put('e', 'E')

    const iterator = promisedDB.db.iterator({
      keyAsBuffer: false,
      valueAsBuffer: false
    })
    iterator.next(function (err, key, value) {
      t.falsy(err, 'no next error')
      t.is(key, 'a')
      t.is(value, 'A')

      promisedDB.del('a')

      iterator.next(function (err, key, value) {
        t.falsy(err, 'no next error')
        t.is(key, 'c')
        t.is(value, 'C')
        t.end()
      })
    })
  })()
})

test.cb('reverse ranges', t => {
  ;(async () => {
    const promisedDB = t.context.promisedDB
    await promisedDB.open()
    await promisedDB.put('a', 'A')
    await promisedDB.put('c', 'C')

    const iterator = promisedDB.db.iterator({
      keyAsBuffer: false,
      valueAsBuffer: false,
      lte: 'b',
      reverse: true
    })
    iterator.next(function (err, key, value) {
      t.falsy(err, 'no next error')
      t.is(key, 'a')
      t.is(value, 'A')
      t.end()
    })
  })()
})

test.cb('delete while iterating', t => {
  ;(async () => {
    const promisedDB = t.context.promisedDB
    await promisedDB.open()
    await promisedDB.put('a', 'A')
    await promisedDB.put('b', 'B')
    await promisedDB.put('c', 'C')

    const iterator = promisedDB.db.iterator({
      keyAsBuffer: false,
      valueAsBuffer: false,
      gte: 'a'
    })

    iterator.next(async function (err, key, value) {
      t.falsy(err, 'no next error')
      t.is(key, 'a')
      t.is(value, 'A')

      await promisedDB.del('b')

      iterator.next(function (err, key, value) {
        t.falsy(err, 'no error')
        t.is(key, 'b')
        t.is(value, 'B')
        t.end()
      })
    })
  })()
})

test.cb('iterator with byte range', t => {
  ;(async () => {
    const promisedDB = t.context.promisedDB
    await promisedDB.open()
    await promisedDB.put(Buffer.from('a0', 'hex'), 'A')

    const iterator = promisedDB.db.iterator({
      valueAsBuffer: false,
      lt: Buffer.from('ff', 'hex')
    })

    iterator.next(function (err, key, value) {
      t.falsy(err, 'no error')
      t.is(key.toString('hex'), 'a0')
      t.is(value, 'A')
      t.end()
    })
  })()
})

test.cb('iterator does not clone key buffers', t => {
  ;(async () => {
    const buf = Buffer.from('a')
    const promisedDB = t.context.promisedDB
    await promisedDB.open()
    await promisedDB.put(buf, 42)

    testCommon.collectEntries(promisedDB.db.iterator(), function (err, entries) {
      t.falsy(err, 'no iterator error')
      t.true(entries[0].key === buf, 'key is same buffer')
      t.end()
    })
  })()
})

test.cb('iterator stringifies buffer input', t => {
  ;(async () => {
    const promisedDB = t.context.promisedDB
    await promisedDB.open()
    await promisedDB.put(1, 2)

    testCommon.collectEntries(promisedDB.db.iterator(), function (err, entries) {
      t.falsy(err, 'no iterator error')
      t.deepEqual(entries[0].key, Buffer.from('1'), 'key is stringified')
      t.deepEqual(entries[0].value, Buffer.from('2'), 'value is stringified')
      t.end()
    })
  })()
})

test.cb('backing rbtree is buffer-aware', t => {
  ;(async () => {
    const promisedDB = t.context.promisedDB
    await promisedDB.open()

    const one = Buffer.from('80', 'hex')
    const two = Buffer.from('c0', 'hex')

    t.true(
      two.toString() === one.toString(),
      'would be equal when not buffer-aware'
    )
    t.true(ltgt.compare(two, one) > 0, 'but greater when buffer-aware')

    await promisedDB.put(one, 'one')
    const value1 = await promisedDB.get(one, { asBuffer: false })
    t.is(value1, 'one', 'value one ok')

    await promisedDB.put(two, 'two')
    const value2 = await promisedDB.get(one, { asBuffer: false })
    t.is(value2, 'one', 'value one is the same')
    t.end()
  })()
})

test.cb('empty value in batch', t => {
  ;(async () => {
    const promisedDB = t.context.promisedDB
    await promisedDB.open()
    await promisedDB.batch([
      {
        type: 'put',
        key: 'empty-string',
        value: ''
      },
      {
        type: 'put',
        key: 'empty-buffer',
        value: Buffer.alloc(0)
      }
    ])

    const value1 = await promisedDB.get('empty-string')
    t.deepEqual(value1, Buffer.alloc(0), 'empty string')
    const value2 = await promisedDB.get('empty-buffer')
    t.deepEqual(value2, Buffer.alloc(0), 'empty buffer')
    t.end()
  })()
})

test.cb('empty buffer key in batch', t => {
  ;(async () => {
    const promisedDB = t.context.promisedDB
    await promisedDB.open()
    promisedDB.db.batch(
      [
        {
          type: 'put',
          key: Buffer.alloc(0),
          value: ''
        }
      ],
      function (err) {
        t.truthy(err, 'got an error')
        t.end()
      }
    )
  })()
})

test.cb('buffer key in batch', t => {
  ;(async () => {
    const promisedDB = t.context.promisedDB
    await promisedDB.open()
    await promisedDB.batch([
      {
        type: 'put',
        key: Buffer.from('foo', 'utf8'),
        value: 'val1'
      }
    ])
    const value = await promisedDB.get(Buffer.from('foo', 'utf8'), {
      asBuffer: false
    })
    t.is(value, 'val1')
    t.end()
  })()
})

test.cb('put multiple times', t => {
  ;(async () => {
    const promisedDB = t.context.promisedDB
    await promisedDB.open()
    await promisedDB.put('key', 'val')
    await promisedDB.put('key', 'val2')
    promisedDB.get('unknownKey', { asBuffer: false }).catch(err => {
      t.truthy(err, 'unknown keys causes error')
    })
    promisedDB.get('key', { asBuffer: false }).then(value => {
      t.is(value, 'val2')
      t.end()
    })
  })()
})

test.cb('number keys', t => {
  ;(async () => {
    const numbers = [2, 12]
    const buffers = numbers.map(stringBuffer)

    const promisedDB = t.context.promisedDB
    await promisedDB.open()
    await promisedDB.batch(numbers.map(putKey))

    const iterator1 = promisedDB.db.iterator({ keyAsBuffer: false })
    const iterator2 = promisedDB.db.iterator({ keyAsBuffer: true })

    testCommon.collectEntries(iterator1, function (err, entries) {
      t.falsy(err, 'no iterator error')
      t.deepEqual(entries.map(getKey), numbers, 'sorts naturally')

      testCommon.collectEntries(iterator2, function (err, entries) {
        t.falsy(err, 'no iterator error')
        t.deepEqual(entries.map(getKey), buffers, 'buffer input is stringified')
        t.end()
      })
    })
  })()
})

test.cb('date keys', t => {
  ;(async () => {
    const dates = [new Date(0), new Date(1)]
    const buffers = dates.map(stringBuffer)

    const promisedDB = t.context.promisedDB
    await promisedDB.open()
    await promisedDB.batch(dates.map(putKey))

    const iterator = promisedDB.db.iterator({ keyAsBuffer: false })
    const iterator2 = promisedDB.db.iterator({ keyAsBuffer: true })

    testCommon.collectEntries(iterator, function (err, entries) {
      t.falsy(err, 'no iterator error')
      t.deepEqual(entries.map(getKey), dates, 'sorts naturally')

      testCommon.collectEntries(iterator2, function (err, entries) {
        t.falsy(err, 'no iterator error')
        t.deepEqual(entries.map(getKey), buffers, 'buffer input is stringified')
        t.end()
      })
    })
  })()
})
