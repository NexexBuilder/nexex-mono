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
  moduleNameMapper: {
    '@nexex/api(.*)$': '<rootDir>/../api/dist/$1',
    '@nexex/types(.*)$': '<rootDir>/../types/dist/$1',
  },
  modulePathIgnorePatterns: [
    '<rootDir>/../api/dist',
    '<rootDir>/../types/dist',
  ],
  coverageReporters: ["text-summary", "html"]
};
