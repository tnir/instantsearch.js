/* eslint-disable import/no-commonjs */
module.exports = {
  ...require('../../jest.config.js'),
  setupFilesAfterEnv: ['../../tests/utils/setupTests.ts'],
};
