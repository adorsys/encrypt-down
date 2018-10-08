function stringBuffer (value) {
  return Buffer.from(String(value))
}

function putKey (key) {
  return {
    type: 'put',
    key: key,
    value: 'value'
  }
}

function getKey (entry) {
  return entry.key
}

function promisify (context) {
  return function (func) {
    return function (...args) {
      return new Promise(function (resolve, reject) {
        const callback = function (err, data) {
          return err ? reject(err) : resolve(data)
        }
        func.bind(context)(...args, callback)
      })
    }
  }
}

module.exports = {
  stringBuffer,
  putKey,
  getKey,
  promisify
}
