const path = require('node:path');

module.exports = {
  dependencies: {
    // Use the same canonical path for Kotlin and autolinking.
    '@io/native': { root: path.resolve(__dirname, 'packages/io-native') },
  },
};
