const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    fileParallelism: false, // tests share one Postgres database, so keep them sequential
    testTimeout: 15000
  }
});
