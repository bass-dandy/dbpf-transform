const fs = require('fs');
const fileHandlers = require('./file-handlers');
const BufferReader = require('./buffer-reader');

const DIR_TYPE_ID = 'e86b1eef';

const typeIdToHandler = {
	'53545223': fileHandlers['STR#'],
	'43545353': fileHandlers.CTSS,
	'42434f4e': fileHandlers.BCON,
	'42484156': fileHandlers.BHAV,
	'4f424a44': () => {}, // OBJD
	'4f424a66': fileHandlers.OBJF,
	'4e524546': fileHandlers.NREF,
	'856ddbac': () => {}, // JPEG
	'474c4f42': fileHandlers.GLOB,
};

const reader = new BufferReader(
	fs.readFileSync('./Hayran_Computer_Engineering.package').buffer
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
	typeIdToHandler[typeId](reader.readBuffer(size));
});
