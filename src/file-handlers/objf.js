const BufferReader = require('../buffer-reader');

module.exports = (buf) => {
	const reader = new BufferReader(buf);

	const objf = {
		filename: new TextDecoder().decode(
			reader.readBuffer(64)
		),
		functions: [],
	};

	// skip header, we don't need it
	reader.seekForward(12);

	objf.count = reader.readUint32();

	for(let i = 0; i < objf.count; i++) {
		objf.functions.push({
			guard: reader.readUint16(),
			action: reader.readUint16(),
		});
	}

	return objf;
};
