module.exports = {
	globals: {
		'ts-jest': {
      tsConfig: 'tsconfig.json'
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
  setupFilesAfterEnv: ['./test/config'],
	preset: 'ts-jest',
	moduleNameMapper: {
    '@nexex/api(.*)$': '<rootDir>/../api/src/$1',
		'@nexex/types(.*)$': '<rootDir>/../types/src/$1',
		'@nexex/orderbook-client(.*)$': '<rootDir>/../orderbook-client/src/$1'
	},
	modulePathIgnorePatterns: [
		'<rootDir>/../api/dist',
		'<rootDir>/../types/dist',
		'<rootDir>/../orderbook-client/dist'
	]
	// coverageReporters: ["text-summary", "html"]
};
