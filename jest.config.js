
module.exports = {
    transform: {
        '^.+\\.jsx?$': 'babel-jest',
      },
      preset: 'babel-preset-jest',
    setupFiles: ['<rootDir>/src/setupTests.js'],
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    testEnvironment: 'jsdom',
    transformIgnorePatterns: [
      'node_modules/(?!(axios)/)',
    ],
    moduleNameMapper: {
      '^.+\\.(css|less|scss)$': 'identity-obj-proxy',
      '^.+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
        '<rootDir>/src/__mocks__/fileMock.js',
    },
  };
