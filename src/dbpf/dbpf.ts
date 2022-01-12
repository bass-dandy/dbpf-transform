import BufferReader from '../buffer-reader';
import BufferWriter from '../buffer-writer';
import {TYPE_ID, getFileType} from '../consts';
import {
	isBconFile,
	isBhavFile,
	isGlobFile,
	isObjdFile,
	isObjfFile,
	isStrFile,
	isNrefFile,
	isBinFile,
} from '../types';
import type {SimsFile, SimsFileMeta} from '../types';

import * as BCON from '../bcon';
import * as BHAV from '../bhav';
import * as GLOB from '../glob';
import * as NREF from '../nref';
import * as OBJD from '../objd';
import * as OBJF from '../objf';
import * as STR  from '../str';

// const DIR_TYPE_ID = 'e86b1eef';

function deserializeFile(typeId: string, buffer: ArrayBuffer) {
	switch(typeId) {
		case TYPE_ID.BCON: return BCON.deserialize(buffer);
		case TYPE_ID.BHAV: return BHAV.deserialize(buffer);
		case TYPE_ID.GLOB: return GLOB.deserialize(buffer);
		case TYPE_ID.NREF: return NREF.deserialize(buffer);
		case TYPE_ID.OBJD: return OBJD.deserialize(buffer);
		case TYPE_ID.OBJF: return OBJF.deserialize(buffer);
		case TYPE_ID.STR:
		case TYPE_ID.CTSS:
		case TYPE_ID.TTAS: return STR.deserialize(buffer);
		default:
			console.log(`No handler for file with typeId ${typeId} (${getFileType(typeId)})`);
			return buffer;
	}
}

export function deserialize(buf: ArrayBuffer) {
	const reader = new BufferReader(buf);

	// skip the first 36 bytes of the header as they're constant
	reader.seekTo(36);

	// parse header
	const indexEntryCount = reader.readUint32();
	const indexOffset = reader.readUint32();
	// skip the last bytes of the header as they're also constant

	// parse index table
	reader.seekTo(indexOffset);
	const indexedFiles: SimsFileMeta[] = [];

	for (let i = 0; i < indexEntryCount; i++) {
		indexedFiles.push({
			typeId: reader.readUint32().toString(16),
			groupId: reader.readUint32(),
			instanceId: reader.readUint32(),
			instanceId2: reader.readUint32(),
			location: reader.readUint32(),
			size: reader.readUint32(),
		});
	}

	const files: SimsFile[] = [];

	// deserialize files
	indexedFiles.forEach((meta) => {
		reader.seekTo(meta.location);
		const buffer = reader.readBuffer(meta.size);

		files.push({
			meta,
			content: deserializeFile(meta.typeId, buffer),
		});
	});

	return files;
};

export function serialize(files: SimsFile[]) {
	const writer = new BufferWriter();

	// write file header
	writer.writeString('DBPF');           // identifier
	writer.writeUint32(1);                // major version
	writer.writeUint32(1);                // minor version
	writer.writeNulls(20);                // 12 unknown bytes, skip date modified + created
	writer.writeUint32(7);                // index major version
	writer.writeUint32(files.length);     // index entry count
	writer.writeUint32(0);                // we'll need to come back later to write the index offset
	writer.writeUint32(files.length * 24) // index table size
	writer.writeNulls(12);                // skip hole count, offset, and size
	writer.writeUint32(2);                // index minor version
	writer.writeNulls(32);                // rest of header is blank / reserved for future versions

	// write files and track meta for index table
	const indexTable: SimsFileMeta[] = [];

	files.forEach((file) => {
		let serializedFile = new ArrayBuffer(0);

		if (isBconFile(file)) {
			serializedFile = BCON.serialize(file.content);
		} else if (isBhavFile(file)) {
			serializedFile = BHAV.serialize(file.content);
		} else if (isGlobFile(file)) {
			serializedFile = GLOB.serialize(file.content);
		} else if (isNrefFile(file)) {
			serializedFile = new TextEncoder().encode(file.content).buffer;
		} else if (isObjdFile(file)) {
			serializedFile = OBJD.serialize(file.content);
		} else if (isObjfFile(file)) {
			serializedFile = OBJF.serialize(file.content);
		} else if (isStrFile(file)) {
			serializedFile = STR.serialize(file.content);
		} else if (isBinFile(file)) {
			serializedFile = file.content;
		}

		indexTable.push({
			...file.meta,
			location: writer.buffer.byteLength,
			size: serializedFile.byteLength,
		});

		writer.writeBuffer(serializedFile);
	});

	// write index table
	const indexOffset = writer.buffer.byteLength;

	indexTable.forEach((meta) => {
		writer.writeUint32(parseInt(meta.typeId, 16));
		writer.writeUint32(meta.groupId);
		writer.writeUint32(meta.instanceId);
		writer.writeUint32(meta.instanceId2);
		writer.writeUint32(meta.location);
		writer.writeUint32(meta.size);
	});

	// lastly, go back to the header and write the index offset
	const view = new DataView(writer.buffer);
	view.setUint32(40, indexOffset, true);

	return view.buffer;
};
