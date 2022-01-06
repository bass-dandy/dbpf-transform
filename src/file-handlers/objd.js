const BufferReader = require('../buffer-reader');

module.exports = (buf) => {
	const reader = new BufferReader(buf);

	const objd = {
		filename: new TextDecoder().decode(
			reader.readBuffer(64)
		),
		type: buf.byteLength >= 0x54
			? reader.seekTo(0x52).readUint16()
			: 0,
		guid: buf.byteLength >= 0x60
			? reader.seekTo(0x5C).readUint32()
			: 0x00000000,
		proxyGuid: buf.byteLength >= 0x7E
			? reader.seekTo(0x7A).readUint32()
			: 0x00000000,
		originalGuid: buf.byteLength >= 0xD0
			? reader.seekTo(0xCC).readUint32()
			: 0x00000000,
	};

	reader.seekTo(64);

	objd.data = reader.readUint16Array(
		Math.floor((buf.byteLength - 64) / 2)
	);

	return objd;
};
