/** @type {import('jest').Config} */
const config = {
    preset: "ts-jest",
    testEnvironment: "node",
    // Map .js extension imports (used by nodenext module resolution) back to the
    // actual TypeScript source files so Jest can resolve them.
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                tsconfig: "./tsconfig.test.json",
            },
        ],
    },
    testMatch: ["**/__tests__/**/*.test.ts"],
    clearMocks: true,
};

module.exports = config;
