import { TWorker } from "@/type/utils.type";
import { aiLog, workerfun, workerPromise } from "../tool/utils";
import { IDqnInitConfig } from "@/type/ai.type";

export interface IGameAiFun {
  saveModel: (...arg: any[]) => Promise<any>;
  recordExperience: (...arg: any[]) => any;
  loadModel: (...arg: any[]) => Promise<any>;
  selectAction: (...arg: any[]) => Promise<any>;
  train: (...arg: any[]) => Promise<any>;
  endTrain: (...arg: any[]) => any;
  init: (...arg: any[]) => Promise<any>;
  clearExp: (...arg: any[]) => any;
}

export default class Dqn {
  name: string;
  attWorker: TWorker;
  gameAi: IGameAiFun;
  accumulatedRewards: number;
  accumulatedPunishment: number;
  stateShape: number;
  mapSize: number;
  actionSpaceSize: number
  constructor(name: string, config: IDqnInitConfig) {
    this.name = name;
    this.attWorker = new Worker(new URL('./advanced_worker.ts', import.meta.url), {
      type: 'module'
    })
    this.attWorker.onmessage = (e) => { };
    const _woreker = this.attWorker;

    this.gameAi = {
      saveModel: async (...data) => await workerPromise(_woreker, 'saveModel', 2000, ...data),
      recordExperience: (...data) => workerfun(_woreker, 'recordExperience', ...data),
      loadModel: async (...data) => await workerPromise(_woreker, 'loadModel', 2000, ...data),
      selectAction: async (...data) => await workerPromise(_woreker, 'selectAction', 2000, ...data),
      train: async (...data) => await workerPromise(_woreker, 'train', 100000, ...data),
      endTrain: (...data) => workerfun(_woreker, 'endTrain', ...data),
      init: async (...data) => await workerPromise(_woreker, 'init', 2000, ...data),
      clearExp: (...data) => workerfun(_woreker, 'clearExp', ...data),
    }
    this.accumulatedRewards = 0;
    this.accumulatedPunishment = 0;
    this.stateShape = config.stateShape;
    if (!config.mapSize) { console.error(`[[  ${this.name} !config.mapSize ]]`) }
    this.mapSize = config.mapSize;
    this.actionSpaceSize = config.actionSpaceSize;
  }
  // 初始化
  async initAi() {
    // aiLog(`开始初始化 ${this.name};`)
    const data = await this.gameAi.init({
       actionSpaceSize: this.actionSpaceSize,
        stateShape: [this.stateShape] , 
      });
    // aiLog(`初始化 ${this.name} 完成:`, data);
    return data
  }
  // 开始训练
  async startTrainWorker() {
    // aiLog(`开始训练:${this.name}`)
    const data = await this.gameAi.train();
    // aiLog(`训练完成:${this.name},data:${data}`);
    return data
  }
  // 结束训练
  endTrainWorker() {
    this.gameAi.endTrain();
  }
  // 打包
  async builderModel() {
    // aiLog(`开始打包::${this.name}`);
    this.attWorker.onmessage = function (e: any) {
      if (e.data.type === 'setItem') {
        localStorage.setItem(e.data.data.path, e.data.data.data)
      }
    }
    const data = await this.gameAi.saveModel(this.name);
    aiLog(`打包完成::${this.name}`);
    return data
  }
  // 加载模型
  async loadModel() {
    // aiLog(`加载模型:${this.name}`)
    const data = await this.gameAi.loadModel(this.name);
    // aiLog(`模型加载完成:${this.name}`);
    return data;
  }
  // 关闭worker
  terminate() {
    this.attWorker?.terminate?.();
    // aiLog('已关闭 worker')
  }
}