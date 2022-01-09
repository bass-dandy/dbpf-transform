import fs from 'fs/promises';
import {deserializePackage} from './io';

async function main() {
	const inFile = await fs.readFile('./out.package');
	return deserializePackage(inFile.buffer);
}

main();
