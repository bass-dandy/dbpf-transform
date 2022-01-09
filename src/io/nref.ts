/**
 * NREF file format: just a utf-8 string!
 */
export function deserialize(buf: ArrayBuffer) {
	return new TextDecoder().decode(buf);
};

export function serialize(str: string) {
	return new TextEncoder().encode(str);
}
