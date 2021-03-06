/**
 * STR# file format:
 *
 * - 64 byte filename
 * - 2 byte format code
 * - 2 byte string set count
 * 
 * rest is <set count> sets of two null-terminated strings
 * - first byte is language ID
 * - 1st string is value
 * - 2nd string is description
 */
import BufferReader from '../buffer-reader';
import BufferWriter from '../buffer-writer';
import type {StrContent} from '../types';

export function deserialize(buf: ArrayBuffer) {
	const reader = new BufferReader(buf);
	const decoder = new TextDecoder();

	const str: StrContent = {
		filename: reader.readFileName(),
		formatCode: reader.readUint16(),
		stringSetCount: reader.readUint16(),
		stringSets: [],
	};

	for (let i = 0; i < str.stringSetCount; i++) {
		str.stringSets.push({
			languageId: reader.readUint8(),
			value: decoder.decode(
				reader.readUntilNull()
			),
			description: decoder.decode(
				reader.readUntilNull()
			),
		});
	}

	return str;
};

export function serialize(data: StrContent) {
	const writer = new BufferWriter();
	const encoder = new TextEncoder();

	const encodedFilename = encoder.encode(data.filename);
	writer.writeBuffer(encodedFilename);
	writer.writeNulls(64 - encodedFilename.byteLength);

	writer.writeUint16(data.formatCode);
	writer.writeUint16(data.stringSetCount);

	for(let i = 0; i < data.stringSetCount; i++) {
		writer.writeUint8(data.stringSets[i].languageId);

		writer.writeBuffer(
			encoder.encode(data.stringSets[i].value)
		);
		writer.writeNulls(1);

		writer.writeBuffer(
			encoder.encode(data.stringSets[i].description)
		);
		writer.writeNulls(1);
	}

	return writer.buffer;
};
