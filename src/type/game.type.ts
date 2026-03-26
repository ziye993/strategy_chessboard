import Block from "@/class/block";
import { TClassData, TId } from "./globel.type";
import Role from "@/class/role";
import { ICenter, TCenters } from "./utils.type";

export type TColorArray = [number, number, number, number];


export type TPoint = { x: number; y: number };

export type TVertexs = TPoint[];

export interface IBlockPoint {
	x: number;
	y: number;
	size: number;
	vertexs: TVertexs;
	maxSize?: number;
	sideLength: number;
	relativeX: number;
	relativeY: number;
}

export interface IBlockConfig {
	color: TColorArray,
}

export interface IBlockInitData {
	realIndex: number;
	content: number;
	id: number;
	point: IBlockPoint;
	maxSize: number;
}

export type TRenderLinePoint = [TPoint[], TColorArray, TColorArray][];

export interface IBlocksMap {
	[key: string | number]: Block;
}

export type TGameType = 'local' | 'line'

export type TInitData = {
	blocks?: IMapBlockData[];
	roles?: TMapRoleData[];
	canvasPadding?: number;
	mapHeight?: number;
	mapWidth?: number;
	mapSize: number;
	gametype: TGameType;
	padding?: number;
}

export interface IGameConfig {
	branchProbability: number;
	branchAttenuation: number;
	blockSize: number;
	effectiveBlockAtt: number;
	notNullBlockProb: number;
	colors: {
		[key: string]: TColorArray[];
	},
	gametype?: TGameType;
	complete?: boolean;
	mapSize?: number;
}

export interface IRoleInitData {
	blocks: Block[],
	name?: TId,
	isRobot?: boolean,
	color: TColorArray,
	nextRole?: () => void,
	localPlayer: boolean;
	isAction?: boolean;
	_fraction?: number;
	actionType?: 1 | 0 | null;
	id?: TId;
}

export interface IMapBlockData {
	realIndex?: number;
	id?: TId | null;
	_content?: number;
	content?: number;
	point: IBlockPoint;
	maxSize: number;
	belongsTo?: TId;
	neighbors: (TId | null)[];
	neighborsPositionIndex: number[];
	isDisadvantaged?: boolean;
}
export type TMapRoleData = Omit<IRoleInitData, 'blocks'> & {
	blocks: (TId | null)[]
}
export interface IMapData {
	canvasPadding?: number | null;
	mapHeight?: number;
	mapWidth?: number;
	mapSize?: number;
	// ...other,
	blocks: IMapBlockData[];
	roles: TMapRoleData[];
	id?: TId,
}

export type TConnectingSectionsCenter = {
	point: ICenter;
	realIndex?: number;
	neighbors: TNeiConnectingSectionsCenter[],
	neighborsPositionIndex: number[],
	visited?: boolean;
}

export type TNeiConnectingSectionsCenter = TConnectingSectionsCenter & { allNei: TNeiConnectingSectionsCenter[] };

export type TNeiConnectingSectionsCenters = TNeiConnectingSectionsCenter[];

export type TConnectingSectionsCenters = TConnectingSectionsCenter[]

export interface IAiInfo {
	targetTrainNumber?: number;
	currentTrainNumber?: number;
	start?: boolean;
	training?: boolean;
	demonstrate?: boolean | number;
	interval?: number;
	attackRobot?: {
		accumulatedRewards: number;
		accumulatedPunishment: number;
		gamma?: number;
		epsilon?: number;
		optTip?: string;
	};
	proliferationRobot?: {
		accumulatedRewards: number;
		accumulatedPunishment: number;
		gamma?: number;
		epsilon?: number;
		optTip?: string;
	};

};

export interface IUpdate {
	currentRole: {
		name: TId;
		fraction: number | undefined;
		isAction: boolean | undefined;
		actionType: 0 | 1 | null | undefined;
		color: string;
	} | undefined;
	gameType?: TGameType;
	isStart?: boolean | undefined;
	winRole?: Role | null;
	animation?: boolean;
	roles?: {
		name: TId;
		color: TColorArray;
	}[] | undefined;
	aiInfo?: IAiInfo;
	error?: any;
}

export type TBlockMap = { [key: string]: Block };

export interface IInitGameConfig {
	canvasPadding?: number;
	mapHeight?: number;
	mapWidth?: number;
	mapSize?: number;
	blocks?: IMapBlockData[];
	roles?: TMapRoleData[];
	id?: TId,
}
