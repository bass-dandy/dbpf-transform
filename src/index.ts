import {readFileSync} from 'fs';
import {typeIdToHandler} from './file-handlers/index';
import BufferReader from './buffer-reader';

const DIR_TYPE_ID = 'e86b1eef';

const reader = new BufferReader(
	readFileSync('./Hayran_Computer_Engineering.package').buffer
);

// skip the first 36 bytes of the header as they're constant
reader.seekTo(36);

// parse header
const indexEntryCount = reader.readUint32();
const indexOffset = reader.readUint32();
const indexSize = reader.readUint32();
// skip the last bytes of the header as they're also constant

// parse index table
reader.seekTo(indexOffset);
const indexedFiles = [];

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

// deserialize files
indexedFiles.forEach((fileInfo) => {
	const { typeId, location, size } = fileInfo;
	reader.seekTo(location);
	typeIdToHandler[typeId].deserialize(reader.readBuffer(size));
});
