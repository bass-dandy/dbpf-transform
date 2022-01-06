module.exports = (buf) => {
	const view = new DataView(buf);

	const fname = buf.slice(0, 64);
	const formatCode = view.getUint16(64);
	const setCount = view.getUint16(66, true);
	const stringView = new DataView(buf.slice(68));

	const nullTerms = [];
	for (let i = 0; i < stringView.byteLength; i++) {
		if (stringView.getUint8(i) === 0) {
			nullTerms.push(i);
		}
	}

	const strings = [];
	let start = 68;
	for (let i = 0; i < nullTerms.length; i += 2) {
		const value = buf.slice(start, start + nullTerms[i]);
		start = start + nullTerms[i];

		const description = buf.slice(start, start + nullTerms[i + 1]);
		start = start + nullTerms[i + 1];

		strings.push({
			value: new TextDecoder().decode(value),
			description: new TextDecoder().decode(description),
		});
	}

	return strings;
};
