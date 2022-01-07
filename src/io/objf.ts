import BufferReader from '../buffer-reader';
import type {ObjfContent} from '../types';

export function deserialize(buf: ArrayBuffer) {
	const reader = new BufferReader(buf);

	const objf: ObjfContent = {
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
