import BufferReader from '../buffer-reader';

export type BhavInstruction = {
	opcode: number;
	addr1: number;
	addr2: number;
	nodeVersion: number;
	operands: number[];
};

export type BhavFile = {
	filename: string;
	format: number;
	count: number;
	type: number;
	argc: number;
	locals: number;
	headerFlag: number;
	treeVersion: number;
	cacheFlags: number;
	instructions: BhavInstruction[];
};

/**
 * Deserialize BHAV files
 *
 * file format:
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
export function deserialize(buf: ArrayBuffer) {
	const reader = new BufferReader(buf);

	const bhav: BhavFile = {
		filename: new TextDecoder().decode(reader.readBuffer(64)),
		format: reader.readUint16(),
		count: reader.readUint16(),
		type: reader.readUint8(),
		argc: reader.readUint8(),
		locals: reader.readUint8(),
		headerFlag: reader.readUint8(),
		treeVersion: reader.readUint32(),
		cacheFlags: 0,
		instructions: [],
	};

	if (bhav.format > 0x8008) {
		bhav.cacheFlags = reader.readUint8();
	}

	while (bhav.instructions.length < bhav.count) {
		const instruction: BhavInstruction = {
			opcode: reader.readUint16(),
			addr1: 0,
			addr2: 0,
			nodeVersion: 0,
			operands: [],
		};

		if (bhav.format < 0x8007) {
			instruction.addr1 = reader.readUint8();
			instruction.addr2 = reader.readUint8();
		} else {
			instruction.addr1 = reader.readUint16();
			instruction.addr2 = reader.readUint16();
		}

		if (bhav.format < 0x8003) {
			instruction.operands = reader.readUint8Array(8);
		} else if (bhav.format < 0x8005) {
			instruction.operands = reader.readUint8Array(16);
		} else {
			instruction.nodeVersion = reader.readUint8();
			instruction.operands = reader.readUint8Array(16);
		}

		bhav.instructions.push(instruction);
	}

	return bhav;
};
