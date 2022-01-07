import BufferReader from '../buffer-reader';
import type {BconContent} from '../types';

/**
 * BCON (behavior constants) file format:
 *
 * 66 byte header
 * - 64 byte file name
 * - 1 bit flag
 * - 15 bit item count
 *
 * rest of file is <item count> 2 byte items (might be signed in some contexts, eg motive deltas)
 */
export function deserialize(buf: ArrayBuffer) {
	const reader = new BufferReader(buf);

	const bcon: BconContent = {
		filename: new TextDecoder().decode(
			reader.readBuffer(64)
		),
		flag: false,
		itemCount: 0,
		items: [],
	};

	const flagAndCount = reader.readUint16();
	bcon.flag = (flagAndCount & 0b1000000000000000) !== 0;
	bcon.itemCount = flagAndCount & 0b0111111111111111;

	for (let i = 0; i < bcon.itemCount; i++) {
		bcon.items.push(reader.readUint16());
	}

	return bcon;
};
