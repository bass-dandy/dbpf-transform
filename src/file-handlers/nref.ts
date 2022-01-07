export function deserialize(buf: ArrayBuffer) {
	return new TextDecoder().decode(buf);
};
