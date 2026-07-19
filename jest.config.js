module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@env$': '<rootDir>/src/config/__mocks__/env.ts',
    '\\.css$': '<rootDir>/src/config/__mocks__/styleMock.js',
    '\\.(wav|mp3)$': '<rootDir>/src/config/__mocks__/fileAssetMock.js',
    '^@soundtouchjs/core$':
      '<rootDir>/node_modules/@soundtouchjs/core/.dist/index.js',
    '^@soundtouchjs/interpolation-strategy-lanczos$':
      '<rootDir>/node_modules/@soundtouchjs/interpolation-strategy-lanczos/.dist/index.js',
    '^@soundtouchjs/interpolation-strategy-linear$':
      '<rootDir>/node_modules/@soundtouchjs/interpolation-strategy-linear/.dist/index.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|nativewind|react-native-css-interop|react-native-svg|lucide-react-native|@soundtouchjs)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__mocks__/**',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/server/', '/android/', '/ios/'],
};
