const BufferReader = require('../buffer-reader');

/**
 * Deserialize BCON (behavior constants) files
 *
 * file format:
 *
 * 66 byte header
 * - 64 byte file name
 * - 1 bit flag
 * - 15 bit item count
 *
 * rest of file is <item count> 2 byte items (might be signed in some contexts, eg motive deltas)
 */
module.exports = (buf) => {
	const reader = new BufferReader(buf);

	const bcon = {
		filename: new TextDecoder().decode(
			reader.readBuffer(64)
		),
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
