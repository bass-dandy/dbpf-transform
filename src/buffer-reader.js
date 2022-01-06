function BufferReader(buf) {
	this.view = new DataView(buf);
	this.cursor = 0;
}

BufferReader.prototype.seekForward = function(distance) {
	this.cursor += distance;
};

BufferReader.prototype.seekTo = function(index) {
	this.cursor = index;
};

BufferReader.prototype.readUint8 = function() {
	const int8 = this.view.getUint8(this.cursor, true);
	this.cursor += 1;
	return int8;
};

BufferReader.prototype.readUint16 = function() {
	const int16 = this.view.getUint16(this.cursor, true);
	this.cursor += 2;
	return int16;
};

BufferReader.prototype.readUint32 = function() {
	const int32 = this.view.getUint32(this.cursor, true);
	this.cursor += 4;
	return int32;
};

BufferReader.prototype.readBuffer = function(len) {
	const buf = this.view.buffer.slice(this.cursor, this.cursor + len);
	this.cursor += len;
	return buf;
};

BufferReader.prototype.readUntilNull = function() {
	for (let i = this.cursor; i < this.view.byteLength; i++) {
		if (this.view.getUint8(i) === 0) {
			const result = this.view.buffer.slice(this.cursor, i);
			this.cursor = i + 1;
			return result;
		}
	}
};

BufferReader.prototype.readUint8Array = function(len) {
	const byteArray = [];
	for (let i = 0; i < len; i++) {
		byteArray.push(this.readUint8());
	}
	return byteArray;
};

module.exports = BufferReader;
