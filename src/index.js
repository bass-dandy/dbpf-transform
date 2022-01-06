const fs = require('fs');
const fileHandlers = require('./file-handlers');

const DIR_TYPE_ID = 'e86b1eef';

const typeIdToHandler = {
	'53545223': fileHandlers['STR#'],
	'43545353': fileHandlers.CTSS,
	'42434f4e': fileHandlers.BCON,
	'42484156': fileHandlers.BHAV,
	'4f424a44': () => {}, // OBJD
	'4f424a66': () => {}, // OBJF
	'4e524546': fileHandlers.NREF,
	'856ddbac': () => {}, // JPEG
	'474c4f42': () => {}, // GLOB
};

const fileBuf = fs.readFileSync('./Hayran_Computer_Engineering.package').buffer;

function parseHeader(headerBuf) {
	const header = new DataView(headerBuf);

	return {
		indexEntryCount: header.getUint32(36, true),
		indexOffset: header.getUint32(40, true),
		indexSize: header.getUint32(44, true),
	};
}

const {
	indexEntryCount,
	indexOffset,
	indexSize,
} = parseHeader(fileBuf.slice(0, 96));

function parseIndexTable(indexTableBuf) {
	const indexedFiles = [];

	for (let i = 0; i < indexEntryCount; i++) {
		const start = i * 24;

		const fileInfo = new DataView(
			indexTableBuf.slice(start, start + 24)
		);

		indexedFiles.push({
			typeId: fileInfo.getUint32(0, true).toString(16),
			groupId: fileInfo.getUint32(4, true),
			instanceId: fileInfo.getUint32(8, true),
			instanceId2: fileInfo.getUint32(12, true),
			location: fileInfo.getUint32(16, true),
			size: fileInfo.getUint32(20, true),
		});
	}

	return indexedFiles;
}

const indexedFiles = parseIndexTable(
	fileBuf.slice(indexOffset, indexOffset + indexSize)
);

indexedFiles.forEach((fileInfo) => {
	const { typeId, location, size } = fileInfo;

	typeIdToHandler[typeId](
		fileBuf.slice(location, location + size)
	);
});
