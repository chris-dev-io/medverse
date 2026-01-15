module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/test"],
    testMatch: ["**/*.test.ts"],
    moduleFileExtensions: ["ts", "js"],
    clearMocks: true,

    testPathIgnorePatterns: [
        "<rootDir>/test/session.http.integration.test.ts",
        "<rootDir>/test/session.repo.integration.test.ts"
    ]
};
