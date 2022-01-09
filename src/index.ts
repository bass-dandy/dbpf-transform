import fs from 'fs/promises';
import {deserializePackage, serializePackage} from './io';

async function main() {
	const inPackage = await fs.readFile('./Hayran_Computer_Engineering.package');
	const files = deserializePackage(inPackage.buffer);
	const outPackage = serializePackage(files);
	await fs.writeFile('./out.package', Buffer.from(outPackage));
}

main();
