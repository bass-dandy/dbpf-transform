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
	const fname = buf.slice(0, 64);
	const view = new DataView(buf);
	const header = view.getUint16(64, true);
	const flag = (header & 0b1000000000000000) !== 0;
	const itemCount = header & 0b0111111111111111;

	const items = [];
	for (let i = 0; i < itemCount; i++) {
		items.push(
			view.getInt16(66 + (i * 2), true)
		);
	}

	return {
		fname: new TextDecoder().decode(fname),
		flag,
		items
	};
};
