import fs from 'fs/promises';
import path from 'path';
import {serialize} from './str#';

describe('STR#', () => {
	it('can serialize STR# files', async () => {
		const validFile = await fs.readFile(
			path.join(__dirname, 'fixtures/valid.str#')
		);

		const serializedFile = serialize({
			filename: 'Attribute Labels',
			formatCode: 65533,
			stringSetCount: 2,
			stringSets: [{
				languageId: 1,
				value: 'Job Type',
				description: 'The Sims 2 - Needs Translation - Batch15',
			}, {
				languageId: 1,
				value: 'Availability',
				description: 'The Sims 2 - Needs Translation - Batch15',
			}],
		});

		expect(serializedFile).toMatchBuffer(validFile);
	});
});
