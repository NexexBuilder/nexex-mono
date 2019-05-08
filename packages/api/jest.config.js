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
	preset: 'ts-jest',
	moduleNameMapper: {
		'@nexex/types(.*)$': '<rootDir>/../types/src/$1',
		'@nexex/orderbook-client(.*)$': '<rootDir>/../orderbook-client/src/$1'
	},
	modulePathIgnorePatterns: [
		'<rootDir>/packages/api/build',
		'<rootDir>/packages/types/build',
		'<rootDir>/packages/orderbook-client/build'
	]
	// coverageReporters: ["text-summary", "html"]
};
