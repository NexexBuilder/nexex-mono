module.exports = {
	globals: {
		'ts-jest': {
			// tsConfigFile: 'tsconfig-jest.json'
		}
	},
	moduleFileExtensions: [
		'ts',
		'js',
        "node",
		"json"
	],
	transform: {
		'^.+\\.(ts|tsx)$': './node_modules/ts-jest/preprocessor.js'
	},
	testMatch: [
		'**/test/**/*.(test|spec).(ts|js)'
	],
	testEnvironment: 'node',
    setupTestFrameworkScriptFile: './test/config',
    coverageReporters: ["text-summary", "html"]
};
