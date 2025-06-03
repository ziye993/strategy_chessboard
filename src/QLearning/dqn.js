import { aiLog, workerfun, workerPromise } from "../tool/utils";



export default class Dqn {
  constructor(name, config = {}) {
    this.name = name;
    this.attWorker = new Worker(new URL('./advanced_worker.js', import.meta.url));
    this.attWorker.postMessage({ type: 'getStorege', data: localStorage.getItem(this.name) });
    this.attWorker.onmessage = (e) => { };
    const _woreker = this.attWorker;
    // this.gameAi = new GameAITrainer({ actionSpaceSize: 150150, stateShape: [13 * 150] });
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
    this.characteristicSize = config.characteristicSize;
    if (!config.mapSize) { console.error(`[[  ${this.name} !config.mapSize ]]`) }
    this.mapSize = config.mapSize;
    this.actionSpaceSize = config.actionSpaceSize;
  }
  // 初始化
  async initAi() {
    // aiLog(`开始初始化 ${this.name};`)
    const data = await this.gameAi.init({ actionSpaceSize: Number("" + this.mapSize + "" + this.mapSize), stateShape: [this.characteristicSize * this.mapSize] });
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
    this.attWorker.onmessage = function (e) {
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
    this.attWorker.terminate();
    // aiLog('已关闭 worker')
  }
}