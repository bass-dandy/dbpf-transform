import BufferReader from '../buffer-reader';
import {TYPE_ID} from '../consts';
import type {SimsFile, SimsFileMeta} from '../types';

import * as BCON from './bcon';
import * as BHAV from './bhav';
import * as GLOB from './glob';
import * as NREF from './nref';
import * as OBJD from './objd';
import * as OBJF from './objf';
import * as STR_ from './str#';

const DIR_TYPE_ID = 'e86b1eef';

function deserializeFile(typeId: string, buffer: ArrayBuffer) {
	switch(typeId) {
		case TYPE_ID.BCON: return BCON.deserialize(buffer);
		case TYPE_ID.BHAV: return BHAV.deserialize(buffer);
		case TYPE_ID.CTSS: return STR_.deserialize(buffer);
		case TYPE_ID.GLOB: return GLOB.deserialize(buffer);
		case TYPE_ID.NREF: return NREF.deserialize(buffer);
		case TYPE_ID.OBJD: return OBJD.deserialize(buffer);
		case TYPE_ID.OBJF: return OBJF.deserialize(buffer);
		case TYPE_ID.STR_: return STR_.deserialize(buffer);
		case TYPE_ID.JPEG: return buffer;
		default:
			console.log(`No handler for file with typeId ${typeId}`);
	}
}

export function deserializePackage(buf: ArrayBuffer) {
	const reader = new BufferReader(buf);

	// skip the first 36 bytes of the header as they're constant
	reader.seekTo(36);

	// parse header
	const indexEntryCount = reader.readUint32();
	const indexOffset = reader.readUint32();
	const indexSize = reader.readUint32();
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

	const filesByType: Record<string, SimsFile[]> = {};

	// deserialize files
	indexedFiles.forEach((meta) => {
		reader.seekTo(meta.location);
		const buffer = reader.readBuffer(meta.size);

		if (!filesByType[meta.typeId]) {
			filesByType[meta.typeId] = [];
		}

		filesByType[meta.typeId].push({
			meta,
			content: deserializeFile(meta.typeId, buffer),
		});
	});

	return filesByType;
}
