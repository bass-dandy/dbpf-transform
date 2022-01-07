import {readFileSync} from 'fs';
import {deserializePackage} from './io';

const filesByType = deserializePackage(
	readFileSync('./Hayran_Computer_Engineering.package').buffer
);

console.log(filesByType);
