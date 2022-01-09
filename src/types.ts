import {TYPE_ID} from './consts';

export type BconContent = {
	filename: string;
	flag: boolean;
	itemCount: number;
	items: number[];
};

export type BhavInstruction = {
	opcode: number;
	addr1: number;
	addr2: number;
	nodeVersion: number;
	operands: number[];
};

export type BhavContent = {
	filename: string;
	format: number;
	count: number;
	type: number;
	argc: number;
	locals: number;
	headerFlag: number;
	treeVersion: number;
	cacheFlags: number;
	instructions: BhavInstruction[];
};

export type GlobContent = {
	filename: string;
	length: number;
	semiglobal: string;
};

export type ObjdContent = {
	filename: string;
	type: number;
	guid: number;
	proxyGuid: number;
	originalGuid: number;
	data: number[];
};

export type ObjfContent = {
	filename: string;
	header: number[];
	count: number;
	functions: {
		guard: number;
		action: number;
	}[];
};

export type StrContent = {
	filename: string;
	formatCode: number;
	stringSetCount: number;
	stringSets: {
		languageId: number;
		value: string;
		description: string;
	}[];
};

export type SimsFileMeta = {
	typeId: string;
	groupId: number;
	instanceId: number;
	instanceId2: number;
	location: number;
	size: number;
};

export type SimsFile = {
	meta: SimsFileMeta;
	content?:
		| BconContent
		| BhavContent
		| GlobContent
		| ObjdContent
		| ObjfContent
		| StrContent
		| ArrayBuffer
		| string;
};

export type BconFile = SimsFile & {
	meta: SimsFileMeta & { typeId: typeof TYPE_ID.BCON; };
	content: BconContent;
};

export function isBconFile(file: SimsFile): file is BconFile {
	return file.meta.typeId === TYPE_ID.BCON;
}

export type BhavFile = SimsFile & {
	meta: SimsFileMeta & { typeId: typeof TYPE_ID.BHAV; };
	content: BhavContent;
};

export function isBhavFile(file: SimsFile): file is BhavFile {
	return file.meta.typeId === TYPE_ID.BHAV;
}

export type GlobFile = SimsFile & {
	meta: SimsFileMeta & { typeId: typeof TYPE_ID.GLOB; };
	content: GlobContent;
};

export function isGlobFile(file: SimsFile): file is GlobFile {
	return file.meta.typeId === TYPE_ID.GLOB;
}

export type NrefFile = SimsFile & {
	meta: SimsFileMeta & { typeId: typeof TYPE_ID.NREF; };
	content: string;
};

export function isNrefFile(file: SimsFile): file is NrefFile {
	return file.meta.typeId === TYPE_ID.NREF;
}

export type ObjdFile = SimsFile & {
	meta: SimsFileMeta & { typeId: typeof TYPE_ID.OBJD; };
	content: ObjdContent;
};

export function isObjdFile(file: SimsFile): file is ObjdFile {
	return file.meta.typeId === TYPE_ID.OBJD;
}

export type ObjfFile = SimsFile & {
	meta: SimsFileMeta & { typeId: typeof TYPE_ID.OBJF; };
	content: ObjfContent;
};

export function isObjfFile(file: SimsFile): file is ObjfFile {
	return file.meta.typeId === TYPE_ID.OBJF;
}

export type StrFile = SimsFile & {
	meta: SimsFileMeta & { typeId: typeof TYPE_ID.STR_ | typeof TYPE_ID.CTSS; };
	content: StrContent;
};

export function isStrFile(file: SimsFile): file is StrFile {
	return file.meta.typeId === TYPE_ID.STR_
		|| file.meta.typeId === TYPE_ID.CTSS
		|| file.meta.typeId === TYPE_ID.TTAS;
}

export type BinFile = SimsFile & { content: ArrayBuffer; };

export function isBinFile(file: SimsFile): file is BinFile {
	Object.values(TYPE_ID).forEach((typeId) => {
		if (file.meta.typeId === typeId) {
			return false;
		}
	});
	return true;
}
