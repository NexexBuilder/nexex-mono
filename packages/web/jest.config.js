module.exports = {
	globals: {
		'ts-jest': {
			tsConfigFile: 'tsconfig.json'
		}
	},
	moduleFileExtensions: [
		'ts',
		'js',
        "node",
		"json"
	],
	transform: {
		'^.+\\.(ts|tsx)$': 'ts-jest'
	},
	testMatch: [
		'**/test/**/*.test.(ts|js)'
	],
	testEnvironment: 'node',
    setupTestFrameworkScriptFile: './test/config',
	preset: 'ts-jest'
    // coverageReporters: ["text-summary", "html"]
};
