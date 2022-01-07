import BufferReader from '../buffer-reader';

export type ObjfFile = {
	filename: string;
	count: number;
	functions: {
		guard: number;
		action: number;
	}[];
};

export function deserialize(buf: ArrayBuffer) {
	const reader = new BufferReader(buf);

	const objf: ObjfFile = {
		filename: new TextDecoder().decode(
			reader.readBuffer(64)
		),
		count: 0,
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
