import BufferReader from '../buffer-reader';

export type StrFile = {
	filename: string;
	formatCode: number;
	stringSetCount: number;
	stringSets: {
		value: string;
		description: string;
	}[];
};

export function deserialize(buf: ArrayBuffer) {
	const reader = new BufferReader(buf);

	const str: StrFile = {
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
