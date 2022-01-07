import BufferReader from '../buffer-reader';

export type GlobFile = {
	filename: string;
	length: number;
	semiglobal: string;
};

export function deserialize(buf: ArrayBuffer) {
	const reader = new BufferReader(buf);

	const glob: GlobFile = {
		filename: new TextDecoder().decode(
			reader.readBuffer(64)
		),
		length: reader.readUint8(),
		semiglobal: '',
	};

	glob.semiglobal = new TextDecoder().decode(
		reader.readBuffer(glob.length)
	);

	return glob;
};
