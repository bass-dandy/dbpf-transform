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
module.exports = (buf) => {
	const fname = buf.slice(0, 64);

	const view = new DataView(buf);

	const bhav = {
		fname: new TextDecoder().decode(fname),
		format: view.getUint16(64, true),
		count: view.getUint16(66, true),
		type: view.getUint8(68, true),
		argc: view.getUint8(69, true),
		locals: view.getUint8(70, true),
		headerFlag: view.getUint8(71, true),
		treeVersion: view.getUint32(72, true),
		cacheFlags: 0,
		instructions: [],
	};

	let content;

	if (bhav.format > 0x8008) {
		bhav.cacheFlags = view.getUint8(76, true);
		content = new DataView(buf.slice(77));
	} else {
		content = new DataView(buf.slice(76));
	}

	while (bhav.instructions.length < bhav.count) {
		const start = bhav.instructions.length * 23;

		const instruction = {
			opcode: content.getUint16(start, true),
			operands: [],
		};

		let operandStart;
		if (bhav.format < 0x8007) {
			instruction.addr1 = content.getUint8(start + 2, true);
			instruction.addr2 = content.getUint8(start + 3, true);
			operandStart = start + 4;
		} else {
			instruction.addr1 = content.getUint16(start + 2, true);
			instruction.addr2 = content.getUint16(start + 4, true);
			operandStart = start + 6;
		}

		if (bhav.format < 0x8003) {
			instruction.nodeVersion = 0;
			for (let i = 0; i < 8; i++) {
				instruction.operands.push(
					content.getUint8(operandStart + i, true)
				);
			}
		} else if (bhav.format < 0x8005) {
			instruction.nodeVersion = 0;
			for (let i = 0; i < 16; i++) {
				instruction.operands.push(
					content.getUint8(operandStart + i, true)
				);
			}
		} else {
			instruction.nodeVersion = content.getUint8(operandStart, true);
			for (let i = 0; i < 16; i++) {
				instruction.operands.push(
					content.getUint8(operandStart + 1 + i, true)
				);
			}
		}

		bhav.instructions.push(instruction);
	}

	return bhav;
};
