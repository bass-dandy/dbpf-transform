import * as BCON from './bcon';
import * as BHAV from './bhav';
import * as CTSS from './str';
import * as DEBUG from './debug';
import * as GLOB from './glob';
import * as NREF from './nref';
import * as OBJD from './objd';
import * as OBJF from './objf';
import * as STR from './str';

export type FileHandler = {
	deserialize: (buf: ArrayBuffer) => any;
};

export const typeIdToHandler: Record<string, FileHandler> = {
	'53545223': STR,
	'43545353': CTSS,
	'42434f4e': BCON,
	'42484156': BHAV,
	'4f424a44': OBJD,
	'4f424a66': OBJF,
	'4e524546': NREF,
	'474c4f42': GLOB,
	'856ddbac': {
		// JPEG
		deserialize(buf: ArrayBuffer) {}
	},
};
