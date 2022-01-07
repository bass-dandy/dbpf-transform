import BufferReader from '../buffer-reader';
import type {GlobContent} from '../types';

export function deserialize(buf: ArrayBuffer) {
	const reader = new BufferReader(buf);

	const glob: GlobContent = {
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
