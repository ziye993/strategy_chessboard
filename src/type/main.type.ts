import Block from "@/class/block";
import { IUpdate, TGameType } from "./game.type";

export interface IGameConfig {
  gametype?: TGameType;
  complete?: boolean;
  mapSize?: number;
}

export interface IGameInfo {

}

export interface IUseGameStatus {
  gameInfo: IUpdate | undefined;
  newGame: ((type?: "train") => void) | undefined;
  nextStep: (() => void) | undefined;
  startTrain: ((run: any) => Promise<void>) | undefined;
  setAiInfo: ((info: any) => void) | undefined;
  paushTrain: (() => void) | undefined;
  stepTrain: (() => Promise<void>) | undefined;
  startDemonstrate: (() => void) | undefined;
  setInterval: ((type: number) => void) | undefined;
  getCurrentSelect: (x: number, y: number) => Block | undefined;
}

