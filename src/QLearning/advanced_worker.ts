import * as tf from '@tensorflow/tfjs';
// main.ts
// const worker = new Worker(new URL('./QLearning/advanced_worker.ts', import.meta.url), { type: 'module' });
class IndexedDBUtils {

  dbName: string;
  storeName: string;
  version: number;
  db: any
  constructor(dbName = 'DQNStorege', storeName = 'dqn', version = 1) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.version = version;
    this.db = null;
  }

  // 初始化数据库连接
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event: any) => {
        const a = event?.target?.result;
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        resolve("success");
      };

      request.onerror = (event: any) => {
        reject(new Error(`数据库连接失败: ${event.target.error}`));
      };
    });
  }

  // 存数据（需要 id 和 data）
  async setData(id: string, data: any) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put({ id, ...data });

      request.onsuccess = () => resolve('success');
      request.onerror = () => reject(new Error(`数据存储失败: ${request.error}`));
    });
  }

  // 取数据（根据 id）
  async getData(id: string) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`数据读取失败: ${request.error}`));
    });
  }

  // 关闭数据库连接
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

const store = new IndexedDBUtils();
// eslint-disable-next-line no-restricted-globals
const _self = self;

const localStorage: any = {
  setItem: async (str: string, data: any) => {
    await store.setData(str, data)
  },
  getItem: async (str: string) => {
    return await store.getData(str)
  }
}

interface IParam {
  actionSpaceSize: number;
  stateShape: number[];
  hiddenLayers?: [number, number];
  learningRate?: number;
  gamma?: number;
  epsilon?: number;
  epsilonDecay?: number;
  epsilonMin?: number;
  memorySize?: number;
  batchSize?: number;
  trainingInterval?: number;
  targetUpdateInterval?: number;
}
class GameAITrainer {
  actionSpaceSize!: number;
  stateShape: number[];
  model: tf.Sequential;
  targetModel: tf.Sequential;
  optimizer!: tf.Optimizer;
  hiddenLayers!: [number, number];// = hiddenLayers;
  learningRate!: number;// = learningRate;

  // 强化学习参数
  gamma!: number;//  折扣因子
  epsilon!: number;//   探索率
  epsilonDecay!: number;// = epsilonDecay;
  epsilonMin!: number;// = epsilonMin;

  // 经验回放参数
  memory!: any[];// = [];
  memorySize!: number;// = memorySize;
  batchSize!: number;// = batchSize;

  // 训练控制参数
  trainingStep!: number;// = 0;
  trainingInterval!: number;// = trainingInterval;
  targetUpdateInterval!: number;// = targetUpdateInterval;

  constructor(param: IParam) {
    console.log()
    // 核心函数
    this.actionSpaceSize = param.actionSpaceSize;
    this.stateShape = param.stateShape;
    this._initOtherParam(param);
    // 创建神经网络
    this.model = this._createModel();
    this.targetModel = this._createModel();
    this._updateTargetModel();
  }

  _createModel() {
    const model = tf.sequential();
    model.add(tf.layers.dense({
      inputShape: this.stateShape,
      units: 64,
      activation: 'relu'
    }));
    model.add(tf.layers.dense({
      units: 32,
      activation: 'relu'
    }));
    model.add(tf.layers.dense({
      units: this.actionSpaceSize,
      activation: 'linear'
    }));
    model.compile({
      optimizer: this?.optimizer as tf.Optimizer,
      loss: 'meanSquaredError'
    });
    return model;
  }

  // 初始化模型参数
  _initOtherParam({
    // actionSpaceSize,
    // stateShape,
    hiddenLayers = [64, 64],
    learningRate = 0.001,
    gamma = 0.99,
    epsilon = 1,
    epsilonDecay = 0.9999999,
    epsilonMin = 0.8,
    memorySize = 1000,
    batchSize = 64,
    trainingInterval = 64,
    targetUpdateInterval = 100
  }) {

    // this.actionSpaceSize = actionSpaceSize;
    // this.stateShape = stateShape;

    // 神经网络参数
    this.hiddenLayers = hiddenLayers as [number, number];
    this.learningRate = learningRate;

    // 强化学习参数
    this.gamma = gamma; // 折扣因子
    this.epsilon = epsilon; // 探索率
    this.epsilonDecay = epsilonDecay;
    this.epsilonMin = epsilonMin;

    // 经验回放参数
    this.memory = [];
    this.memorySize = memorySize;
    this.batchSize = batchSize;

    // 训练控制参数
    this.trainingStep = 0;
    this.trainingInterval = trainingInterval;
    this.targetUpdateInterval = targetUpdateInterval;
    this.optimizer = tf.train.adam(learningRate);
  }

  // 更新目标网络
  _updateTargetModel() {
    const weights = this.model.getWeights();
    this.targetModel.setWeights(weights);
  }
  // 记录经验
  async recordExperience(action: any, reward: any, state: any, nextState: any, done: any) {
    this.memory?.push?.({ state, action, reward, nextState, done });
  }


  // 从经验回放中获取随机批次
  _getRandomBatch() {
    const indices: number[] = [];
    while (this?.memory?.length && this.batchSize && indices.length < this.batchSize) {
      const index = Math.floor(Math.random() * this.memory.length);
      if (!indices.includes(index)) {
        indices.push(index);
      }
    }
    return indices.map(index => this?.memory?.[index]);
  }

  //保存模型初始化参数
  async _saveOtherParam(path: string) {
    const param = {
      actionSpaceSize: this.actionSpaceSize,
      stateShape: this.stateShape,
      hiddenLayers: this.hiddenLayers,
      learningRate: this.learningRate,
      gamma: this.gamma,
      epsilon: this.epsilon,
      epsilonDecay: this.epsilonDecay,
      epsilonMin: this.epsilonMin,
      memorySize: this.memorySize,
      batchSize: this.batchSize,
      trainingInterval: this.trainingInterval,
      targetUpdateInterval: this.targetUpdateInterval,
    }
    await localStorage.setItem(path, JSON.stringify(param))
  }
  // 保存模型
  async saveModel(path: string) {
    await this._saveOtherParam(path)
    await this.targetModel.save(`indexeddb://${path}-backup`);
    return await this.model.save(`indexeddb://${path}`);
  }

  // 加载模型
  async loadModel(path: string) {
    let model, targetModel;
    try {
      model = await tf.loadLayersModel(`indexeddb://${path}`);
      targetModel = await tf.loadLayersModel(`indexeddb://${path}-backup`);

    } catch (error) {

    }
    if (!model || !targetModel) {
      console.error(`模型未找到：${path}`)
      return false
    }
    this.model = model as tf.Sequential;
    this.targetModel = targetModel as tf.Sequential;
    const otherParamStr = await localStorage.getItem(path);
    let otherParam: IParam = {} as IParam;
    try {
      otherParam = JSON.parse(otherParamStr);
      this._initOtherParam(otherParam);
    } catch (error) { }

    this.model.compile({
      optimizer: this.optimizer as tf.Optimizer,      // 优化器
      loss: 'meanSquaredError',  // 损失函数
    });
    this._updateTargetModel();
    return true
  }

  // 训练64个数据
  async _trainModel_64() {
    // if (this.memory.length < 64) {
    //   console.log('数据过少：', this.memory.length)
    //   return;
    // }
    if (this?.memory?.length === 0 || this?.memory?.length > 2500) {
      this.memory = []
      console.log('低效数据')
      return;
    }
    const memory = this?.memory?.splice(0, 64);
    if (!memory) return console.error("not memory:", memory);

    // 提取状态、动作、奖励和下一个状态
    const states = memory.map(exp => exp.state);
    const actions = memory.map(exp => exp.action);
    const nextStates = memory.map(exp => exp.nextState);
    const rewards = memory.map(exp => exp.reward);
    const dones = memory.map(exp => exp.done);

    // 创建批处理张量
    const stateTensor = tf.tensor2d(states.flat(), [states.length, ...this.stateShape]);
    const nextStateTensor = tf.tensor2d(nextStates.flat(), [nextStates.length, ...this.stateShape]);
    // gpuInfo = tf.memory();
    // 计算目标Q值
    const targetQs = tf.tidy(() => {
      // 当前Q值预测 [batchSize, actionSpaceSize]
      const currentQs = this.model.predict(stateTensor);

      // 下一状态的Q值预测
      const nextQs = this.targetModel.predict(nextStateTensor);

      // 计算每个样本的最大Q值 [batchSize]
      const maxNextQs = nextQs.max(1);

      // 将标量奖励和折扣因子转换为张量
      const rewardTensor = tf.tensor1d(rewards);
      const gammaTensor = tf.tensor1d(dones?.map?.(d => d ? 0 : this.gamma) as any);

      // 计算目标Q值: Q(s,a) = r + γ * max(Q'(s',a'))
      const targetValues = rewardTensor.add(gammaTensor.mul(maxNextQs));

      // 创建动作掩码，只更新当前选择的动作
      const actionMask = tf.oneHot(actions, this.actionSpaceSize);

      // 将目标值扩展到动作空间维度
      const tqs = targetValues.expandDims(1).mul(actionMask);

      // 保持其他动作的Q值不变，只更新当前动作的Q值
      const targetQs = currentQs.mul(tf.scalar(1).sub(actionMask)).add(tqs)
      // tf.dispose([]);
      return targetQs;
    });
    // nextGpu = tf.memory();
    // 训练模型
    await this.model.fit(stateTensor, targetQs, {
      batchSize: memory.length,
      epochs: 1,
      verbose: 0
    });
    tf.dispose([stateTensor, nextStateTensor, targetQs]);
  }
  // 训练模型
  async _trainModel() {
    // 每批训练64条
    while (this?.memory?.length >= 64) {
      await this._trainModel_64();
      this.trainingStep++;
      // 定期更新q网络
      this._updateTargetModel();
    }
    // 探索率衰减
    if (this.epsilon > 0) {
      this.epsilon = this.epsilon * this.epsilonDecay;
    }
  }

  // 选择动作（带ε-贪婪策略）
  selectAction(state: any, initialActionList: any[]) {

    const id = Math.random();
    // ε-贪婪策略
    if (id <= this.epsilon) {
      const r = Math.random();
      // 随机动作（探索）
      return {
        actionType: 'random',
        aiAction: initialActionList[Math.floor(r * initialActionList.length)]
      }
      // return +`${Math.floor(Math.random() * 150)}.${Math.floor(Math.random() * 150)}`
      // return Math.floor(Math.random() * this.actionSpaceSize);
    } else {
      // 基于当前策略的最优动作
      return {
        actionType: 'ai',
        aiAction: tf.tidy(() => {
          const stateTensor = tf.tensor2d([state]);
          const qValues = this.model.predict(stateTensor);
          console.log(qValues, 'qValues')
          const action = qValues?.argMax?.(1)?.dataSync()[0];
          // tf.dispose([state]);
          return action;
        })
      }
    }
  }
}

let ai !: GameAITrainer; //new GameAITrainer({ actionSpaceSize: 150150, stateShape: [13 * 150] });

let traing = false;

const hasAi = () => {
  if (!ai) throw Error('ai 未初始化::未找到ai');
}

function pushExp(param: { action: any, reward: undefined, state: undefined, nextState: undefined, done: undefined }) {

  const { action, reward, state, nextState, done } = param;
  hasAi();
  ai.memory.push({ action, reward, state, nextState, done });
}

function getState() {
  hasAi();
  return ai.memory.length;
};

async function selectAction(param: { state: any, initialActionList: any[] }) {
  const { state, initialActionList } = param;
  hasAi();
  return await ai.selectAction(state, initialActionList);
}

async function loadModel(path: string) {
  hasAi();
  const modelData = await ai.loadModel(path);
  return modelData
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function start() {
  hasAi();
  if (traing) return
  traing = true;
  const time = Date.now();
  console.log(`开始训练：共计：${ai.memory.length}`);
  await ai._trainModel();
  console.log(`耗时：${Date.now() - time}`)
  traing = false;
}


const postMessage = (e: MessageEvent<any>, data: any, currentIndex?: undefined) => {
  _self.postMessage({
    type: e.data.type,
    id: e.data.id,
    data,
  })
}

interface IInitDataParam {
  actionSpaceSize: number;
  stateShape: number[];
}
interface IMessage {
  data: { data: any[] };
  type: 'init' | 'getData' | 'train' | 'selectAction' | 'recordExperience' | 'saveModel' | 'loadModel' | 'getStorege' | 'endTrain' | 'clearExp';
}

_self.onmessage = async function (e: MessageEvent<any>) {

  // console.log('worker message', e);
  switch (e.data.type) {
    case 'init':
      ai = new GameAITrainer(e?.data?.data?.[0] || {});
      postMessage(e, true)
      break;
    case 'getData':
      const data = await getState();
      postMessage(e, data);
      break;

    case 'train':
      await start();
      postMessage(e, true);
      break;

    case 'selectAction':
      const actionData = await selectAction(e?.data?.data?.[0]);
      postMessage(e, actionData);
      break;

    case 'recordExperience':
      pushExp({ ...e.data.data });
      // postMessage(e, true);
      break;

    case 'saveModel':
      await ai.saveModel(e.data.data);
      postMessage(e, true);
      break;

    case 'loadModel':
      const modelData = await loadModel(e.data.data);
      postMessage(e, modelData);
      break;

    case 'getStorege':
      // storegeData = e.data.data;
      // postMessage(e, true);
      break;

    case 'endTrain':
      traing = false;
      // postMessage(e, true);
      break;

    case 'clearExp':
      ai.memory = [];
      break;

    default:
      postMessage(e, false);
  }

};
