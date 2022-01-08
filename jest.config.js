/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	clearMocks: true,
	setupFilesAfterEnv: ['./jest.setup.ts'],
};
