/**
 * BHAV file format:
 *
 * 76 or 77 byte header
 * - 64 byte filename
 * - 2 byte format type
 * - 2 byte instruction count
 * - 1 byte type
 * - 1 byte arg count
 * - 1 byte local variable count
 * - 1 byte header flag
 * - 4 byte tree version
 * - 1 byte cache flags if format > 0x8008, 0 bytes otherwise
 *
 * rest of file is <instruction count> instructions
 */
import BufferReader from '../buffer-reader';
import BufferWriter from '../buffer-writer';
import type {BhavContent, BhavInstruction} from '../types';

export function deserialize(buf: ArrayBuffer) {
	const reader = new BufferReader(buf);

	const bhav: BhavContent = {
		filename: reader.readFileName(),
		format: reader.readUint16(),
		count: reader.readUint16(),
		type: reader.readUint8(),
		argc: reader.readUint8(),
		locals: reader.readUint8(),
		headerFlag: reader.readUint8(),
		treeVersion: reader.readUint32(),
		instructions: [],
	};

	while (bhav.instructions.length < bhav.count) {
		const instruction: BhavInstruction = {
			opcode: reader.readUint16(),
			gotoOnTrue: 0,
			gotoOnFalse: 0,
			nodeVersion: undefined,
			cacheFlags: undefined,
			operands: [],
		};

		if (bhav.format < 0x8003) {
			instruction.gotoOnTrue  = reader.readUint8();
			instruction.gotoOnFalse = reader.readUint8();
			instruction.operands    = reader.readUint8Array(8);
		} else if (bhav.format < 0x8005) {
			instruction.gotoOnTrue  = reader.readUint8();
			instruction.gotoOnFalse = reader.readUint8();
			instruction.operands    = reader.readUint8Array(16);
		} else if (bhav.format < 0x8007) {
			instruction.gotoOnTrue  = reader.readUint8();
			instruction.gotoOnFalse = reader.readUint8();
			instruction.nodeVersion = reader.readUint8();
			instruction.operands    = reader.readUint8Array(16);
		} else {
			instruction.gotoOnTrue  = reader.readUint16();
			instruction.gotoOnFalse = reader.readUint16();
			instruction.nodeVersion = reader.readUint8();
			instruction.operands    = reader.readUint8Array(16);

			if (bhav.format === 0x8009) instruction.cacheFlags = reader.readUint8();
		}

		bhav.instructions.push(instruction);
	}

	return bhav;
};

export function serialize(data: BhavContent) {
	const writer = new BufferWriter();
	const encoder = new TextEncoder();

	const encodedFilename = encoder.encode(data.filename);
	writer.writeBuffer(encodedFilename);
	writer.writeNulls(64 - encodedFilename.byteLength);

	writer.writeUint16(data.format);
	writer.writeUint16(data.count);
	writer.writeUint8(data.type);
	writer.writeUint8(data.argc);
	writer.writeUint8(data.locals);
	writer.writeUint8(data.headerFlag);
	writer.writeUint32(data.treeVersion);

	for(let i = 0; i < data.count; i++) {
		const instruction = data.instructions[i];

		writer.writeUint16(instruction.opcode);

		if (data.format < 0x8005) {
			writer.writeUint8(instruction.gotoOnTrue);
			writer.writeUint8(instruction.gotoOnFalse);
			writer.writeUint8Array(instruction.operands);
		} else if (data.format < 0x8007) {
			writer.writeUint8(instruction.gotoOnTrue);
			writer.writeUint8(instruction.gotoOnFalse);
			writer.writeUint8(instruction.nodeVersion ?? 0);
			writer.writeUint8Array(instruction.operands);
		} else {
			writer.writeUint16(instruction.gotoOnTrue);
			writer.writeUint16(instruction.gotoOnFalse);
			writer.writeUint8(instruction.nodeVersion ?? 0);
			writer.writeUint8Array(instruction.operands);

			if (data.format === 0x8009) writer.writeUint8(instruction.cacheFlags ?? 0);
		}
	}

	return writer.buffer;
};
