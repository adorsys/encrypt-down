module.exports = function (wallaby) {
  return {
    files: ['src/**/*.js', 'test/helper.js', 'test/**/*.json'],
    tests: ['test/**/*.test.js'],
    env: {
      type: 'node'
    },
    testFramework: 'ava'
  }
}
