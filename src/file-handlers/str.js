const BufferReader = require('../buffer-reader');

module.exports = (buf) => {
	const reader = new BufferReader(buf);

	const str = {
		filename: new TextDecoder().decode(
			reader.readBuffer(64)
		),
		formatCode: reader.readUint16(),
		stringSetCount: reader.readUint16(),
		stringSets: [],
	};

	for (let i = 0; i < str.stringSetCount; i++) {
		str.stringSets.push({
			value: new TextDecoder().decode(
				reader.readUntilNull()
			),
			description: new TextDecoder().decode(
				reader.readUntilNull()
			),
		});
	}

	return str;
};
