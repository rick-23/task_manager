// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
    dir: './', // Path to your Next.js app
});

const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
        // Mock CSS modules and static assets
        '^.+\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^.+\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
    },
    testEnvironment: 'jsdom',
};

module.exports = createJestConfig(customJestConfig);
