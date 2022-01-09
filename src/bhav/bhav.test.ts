import path from 'path';
import {serialize} from './bhav';

describe('BHAV', () => {
	it('can serialize BHAV files', async () => {
		const serializedFile = serialize({
			filename: 'Init',
			format: 32775,
			count: 2,
			type: 0,
			argc: 0,
			locals: 0,
			headerFlag: 0,
			treeVersion: 4294934536,
			cacheFlags: 0,
			instructions: [{
				opcode: 8192,
				addr1: 1,
				addr2: 65532,
				nodeVersion: 1,
				operands: [255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0],
			}, {
				opcode: 2,
				addr1: 65533,
				addr2: 65532,
				nodeVersion: 0,
				operands: [0, 0, 6, 95, 0, 9, 2, 26, 0, 0, 0, 0, 0, 0, 0, 0],
			}],
		});

		await expect(serializedFile).toMatchFile(
			path.join(__dirname, 'fixtures/valid.bhav')
		);
	});
});
