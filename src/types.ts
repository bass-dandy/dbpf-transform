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
