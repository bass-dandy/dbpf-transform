const BufferReader = require('../buffer-reader');

module.exports = (buf) => {
	const reader = new BufferReader(buf);

	const glob = {
		filename: new TextDecoder().decode(
			reader.readBuffer(64)
		),
		length: reader.readUint8(),
	};

	glob.semiglobal = new TextDecoder().decode(
		reader.readBuffer(glob.length)
	);

	return glob;
};
