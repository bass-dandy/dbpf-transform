import BufferReader from '../buffer-reader';
import BufferWriter from '../buffer-writer';
import type {TtabContent, TtabMotiveTable} from '../types';

function readFloat(reader: BufferReader) {
	return Float32Array.of(reader.readUint32())[0];
}

function readMotiveTable(
	format: number,
	counts: number[] | null,
	type: 'human' | 'animal',
	reader: BufferReader
) {
	const tableLength = counts === null
		? Math.max(type === 'human' ? 5 : 8, reader.readUint32())
		: counts.length;

	const table: TtabMotiveTable = { groups: [] };

	// add groups to table
	for (let i = 0; i < tableLength; i++) {
		const groupLength = format < 84
			? Math.max(counts?.[i] ?? 0, 16)
			: reader.readUint32();

		const group: TtabMotiveTable['groups'][number] = { items: [] };

		// add items to group
		for (let j = 0; j < groupLength; j++) {
			if (type === 'human') {
				group.items.push(reader.readUint16());
			} else {
				const itemLength = reader.readUint32();
				const values = [];

				for (let k = 0; k < itemLength; k++) {
					values.push(reader.readUint16());
				}
				group.items.push({ values });
			}
		}
		table.groups.push(group);
	}
	return table;
}

export function deserialize(buf: ArrayBuffer) {
	const reader = new BufferReader(buf);

	const ttab: TtabContent = {
		filename: reader.readFileName(),
		header: [
			reader.readUint32(),
			reader.readUint32(),
			reader.readUint32(),
		],
		items: [],
	};

	const format = ttab.header[1];
	const count = reader.readUint16();

	for (let i = 0; i < count; i++) {
		let counts = null;
		if (format < 68) {
			counts = [16];
		} else if (format < 84) {
			counts = [16, 16, 16, 16, 16, 16, 16];
		}

		ttab.items.push({
			action:           reader.readUint16(),
			guard:            reader.readUint16(),
			counts:           counts?.map(() => reader.readUint32()),
			flags:            reader.readUint16(),
			flags2:           reader.readUint16(),
			strIndex:         reader.readUint32(),
			attenuationCode:  reader.readUint32(),
			attenuationValue: readFloat(reader),
			autonomy:         reader.readUint32(),
			joinIndex:        reader.readUint32(),
			uiDisplayType:    format > 69 ? reader.readUint16() : 0,
			facialAnimation:  format > 74 ? reader.readUint32() : 0,
			memoryIterMult:   format > 76 ? readFloat(reader)   : 0,
			objectType:       format > 76 ? reader.readUint32() : 0,
			modelTableId:     format > 70 ? reader.readUint32() : 0,
			humanGroups:      readMotiveTable(format, counts, 'human', reader),
			animalGroups:     format > 84 ? readMotiveTable(format, counts, 'animal', reader) : null,
		});
	}
	return ttab;
}

function writeMotiveTable(
	format: number,
	counts: number[] | undefined,
	table: TtabMotiveTable,
	writer: BufferWriter
) {
	if (counts === null) writer.writeUint32(table.groups.length);

	table.groups.forEach((group) => {
		if (format < 84) writer.writeUint32(group.items.length);

		group.items.forEach((item) => {
			if (typeof item === 'number') {
				writer.writeUint16(item);
			} else {
				writer.writeUint32(item.values.length);
				item.values.forEach((value) => writer.writeUint16(value));
			}
		});
	});
}

export function serialize(data: TtabContent) {
	const writer = new BufferWriter();
	const encoder = new TextEncoder();
	const format = data.header[1];

	const encodedFilename = encoder.encode(data.filename);
	writer.writeBuffer(encodedFilename);
	writer.writeNulls(64 - encodedFilename.byteLength);

	writer.writeUint32Array(data.header);
	writer.writeUint16(data.items.length);

	data.items.forEach((item) => {
		writer.writeUint16(item.action);
		writer.writeUint16(item.guard);
		writer.writeUint32Array(item.counts || []);
		writer.writeUint16(item.flags);
		writer.writeUint16(item.flags2);
		writer.writeUint32(item.strIndex);
		writer.writeUint32(item.attenuationCode);
		writer.writeUint32(item.attenuationValue);
		writer.writeUint32(item.autonomy);
		writer.writeUint32(item.joinIndex);

		if (format > 69) writer.writeUint16(item.uiDisplayType);
		if (format > 74) writer.writeUint32(item.facialAnimation);
		if (format > 76) {
			writer.writeUint32(item.memoryIterMult);
			writer.writeUint32(item.objectType);
		}
		if (format > 70) writer.writeUint32(item.modelTableId);

		writeMotiveTable(format, item.counts, item.humanGroups, writer);

		if (format > 84 && item.animalGroups) {
			writeMotiveTable(format, item.counts, item.animalGroups, writer);
		}
	});
	return writer.buffer;
}
