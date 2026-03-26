export interface IGetRewardValue {
  blockLength: number;
  threat: number;
  effectiveness?: number;
}

export interface IDqnInitConfig {
  stateShape: number;
  mapSize: number;
  actionSpaceSize: number;
}