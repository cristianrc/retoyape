module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.test.*'],
  coverageThreshold: {
    global: { statements: 70, branches: 70, functions: 70, lines: 70 },
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-safe-area-context)/)',
  ],
};
