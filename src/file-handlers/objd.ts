import BufferReader from '../buffer-reader';

export type ObjdFile = {
	filename: string;
	type: number;
	guid: number;
	proxyGuid: number;
	originalGuid: number;
	data: number[];
};

export function deserialize(buf: ArrayBuffer) {
	const reader = new BufferReader(buf);

	const objd: ObjdFile = {
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
		data: [],
	};

	reader.seekTo(64);

	objd.data = reader.readUint16Array(
		Math.floor((buf.byteLength - 64) / 2)
	);

	return objd;
};
