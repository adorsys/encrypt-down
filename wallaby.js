module.exports = function (wallaby) {
  return {
    files: ['src/**/*.js', 'test/helper.js', 'test/**/*.json'],
    tests: ['test/encrypt-down.test.js'],
    env: {
      type: 'node'
    },
    testFramework: 'ava'
  }
}
