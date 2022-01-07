export function deserialize(buf: ArrayBuffer) {
	console.log(new TextDecoder().decode(buf));
};
