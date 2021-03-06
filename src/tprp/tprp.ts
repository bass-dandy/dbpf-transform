import BufferReader from '../buffer-reader';
import BufferWriter from '../buffer-writer';
import type {TprpContent} from '../types';

function readValue(reader: BufferReader) {
	const decoder = new TextDecoder();
	const len = reader.readUint8();

	return decoder.decode(
		reader.readBuffer(len)
	);
}

function writeValue(writer: BufferWriter, value: string) {
	const encoder = new TextEncoder();

	writer.writeUint8(value.length);
	writer.writeBuffer(
		encoder.encode(value)
	);
}

export function deserialize(buf: ArrayBuffer) {
	const reader = new BufferReader(buf);

	const tprp: TprpContent = {
		filename: reader.readFileName(),
		header: [
			reader.readUint8(),
			reader.readUint8(),
			reader.readUint8(),
		],
		params: [],
		locals: [],
		trailer: [],
	};

	const paramCount = reader.readUint32();
	const localCount = reader.readUint32();

	for (let i = 0; i < paramCount; i++) {
		tprp.params.push({
			label: readValue(reader),
			pdata: 0,
		});
	}

	for (let i = 0; i < localCount; i++) {
		tprp.locals.push(readValue(reader));
	}

	reader.seekForward(4);

	tprp.params.forEach((param) => {
		param.pdata = reader.readUint8();
	});

	tprp.trailer.push(reader.readUint32());
	tprp.trailer.push(reader.readUint32());

	return tprp;
}

export function serialize(data: TprpContent) {
	const writer = new BufferWriter();
	const encoder = new TextEncoder();

	const encodedFilename = encoder.encode(data.filename);
	writer.writeBuffer(encodedFilename);
	writer.writeNulls(64 - encodedFilename.byteLength);

	writer.writeUint8Array(data.header);

	data.params.forEach((param) => {
		writeValue(writer, param.label);
	});

	data.locals.forEach((local) => {
		writeValue(writer, local);
	});

	writer.writeUint32(0);

	data.params.forEach((param) => {
		writer.writeUint8(param.pdata);
	});

	writer.writeUint32Array(data.trailer);

	return writer.buffer;
}
