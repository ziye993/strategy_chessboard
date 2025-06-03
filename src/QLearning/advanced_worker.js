import * as tf from '@tensorflow/tfjs';
import { aiLog } from '../tool/utils';

// eslint-disable-next-line no-restricted-globals
const _self = self;
let storegeData = '';
const localStorage = {
  setItem: (str, data) => {
    _self.postMessage({
      type: 'setItem',
      data: {
        path: str,
        data
      },
    })
  },
  getItem: () => {
    return storegeData
  }
}

export class GameAITrainer {
  constructor(param) {
    // 核心函数
    this.actionSpaceSize = param.actionSpaceSize;
    this.stateShape = param.stateShape;
    this._initOtherParam(param);
    // 创建神经网络
    this.model = this._createModel();
    this.targetModel = this._createModel();
    this._updateTargetModel();
    console.log(this)
  }

  _createModel() {
    const model = tf.sequential();
    model.add(tf.layers.dense({
      inputShape: this.stateShape,
      units: this.hiddenLayers[0],
      activation: 'relu'
    }));
    for (let i = 1; i < this.hiddenLayers.length; i++) {
      model.add(tf.layers.dense({
        units: this.hiddenLayers[i],
        activation: 'relu'
      }));
    }
    model.add(tf.layers.dense({
      units: this.actionSpaceSize,
      activation: 'linear'
    }));
    model.compile({
      optimizer: this.optimizer,
      loss: 'meanSquaredError'
    });
    return model;
  }

  // 初始化模型参数
  _initOtherParam({
    actionSpaceSize,
    stateShape,
    hiddenLayers = [64, 64],
    learningRate = 0.001,
    gamma = 0.99,
    epsilon = 1,
    epsilonDecay = 0.9999999,
    epsilonMin = 0.8,
    memorySize = 1000,
    batchSize = 64,
    trainingInterval = 10,
    targetUpdateInterval = 100
  }) {

    // this.actionSpaceSize = actionSpaceSize;
    // this.stateShape = stateShape;

    // 神经网络参数
    this.hiddenLayers = hiddenLayers;
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
  async recordExperience(action, reward, state, nextState, done) {
    // const state = this.getGameStatus();
    this.memory.push({ state, action, reward, nextState, done });

    // 限制经验回放缓冲区大小
    // if (this.memory.length > this.memorySize) {
    this.memory.shift();
    // }

    // 定期训练
    this.trainingStep++;
    if (this.trainingStep % this.trainingInterval === 0 && this.memory.length >= this.batchSize) {
      await this._trainModel();
    }

    // 定期更新目标网络
    if (this.trainingStep % this.targetUpdateInterval === 0) {
      this._updateTargetModel();
    }

    // 衰减探索率
    // if (this.epsilon > this.epsilonMin) {
    //   this.epsilon *= this.epsilonDecay;
    // }
  }


  // 从经验回放中获取随机批次
  _getRandomBatch() {
    const indices = [];
    while (indices.length < this.batchSize) {
      const index = Math.floor(Math.random() * this.memory.length);
      if (!indices.includes(index)) {
        indices.push(index);
      }
    }
    return indices.map(index => this.memory[index]);
  }

  //保存模型初始化参数
  _saveOtherParam(path) {
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
    localStorage.setItem(path, JSON.stringify(param))
  }
  // 保存模型
  async saveModel(path) {
    this._saveOtherParam(path)
    return await this.model.save(`indexeddb://${path}`);
  }

  // 加载模型
  async loadModel(path) {
    let model;
    try {
      model = await tf.loadLayersModel(`indexeddb://${path}`);
    } catch (error) {

    }
    if (!model) {
      console.error(`模型未找到：${path}`)
      return false
    }
    this.model = model;
    this.targetModel = model;
    const otherParamStr = localStorage.getItem(path);
    let otherParam = {};
    try {
      otherParam = JSON.parse(otherParamStr);
      this._initOtherParam(otherParam);
    } catch (error) { }

    this.model.compile({
      optimizer: this.optimizer,      // 优化器
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
    if (this.memory.length === 0 || this.memory.length > 2500) {
      this.memory = []
      console.log('低效数据')
      return;
    }
    const memory = this.memory.splice(0, 64);
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
      const gammaTensor = tf.tensor1d(dones.map(d => d ? 0 : this.gamma));

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
    while (this.memory.length >= 64) {
      await this._trainModel_64();
    }
    if (this.epsilon > 0.01) {
      this.epsilon = this.epsilon * this.epsilonDecay;
    } else if (this.epsilon < 0.01 && this.epsilon > 0.005) {
      console.warn(this.epsilon, 'this.epsilon');
      this.epsilon = 0.05
    }
    // nextGpu = tf.memory();
    // console.log(`
    //    使用:${nextGpu.numBytesInGPU};
    //    分配:${nextGpu.numBytesInGPUAllocated};
    // 空闲:${nextGpu.numBytesInGPUFree};
    // `)
  }

  // 选择动作（带ε-贪婪策略）
  selectAction(state, initialActionList) {
    const id = Math.random();
    // ε-贪婪策略
    if (id <= this.epsilon) {
      // 随机动作（探索）
      return {
        actionType: 'random',
        aiAction: initialActionList[Math.floor(Math.random() * initialActionList.length)]
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
          const action = qValues.argMax(1).dataSync()[0];
          tf.dispose([state]);
          return action;
        })
      }
    }
  }
}

let ai; //new GameAITrainer({ actionSpaceSize: 150150, stateShape: [13 * 150] });

let traing = false;

const hasAi = () => {
  if (!ai) throw Error('ai 未初始化::未找到ai');
}

function pushExp(action, reward, state, nextState, done) {
  hasAi();
  ai.memory.push({ action, reward, state, nextState, done });
}

function getState() {
  hasAi();
  return ai.memory.length;
};

async function selectAction(state, initialActionList) {
  hasAi();
  return await ai.selectAction(state, initialActionList);
}

async function loadModel(path) {
  hasAi();
  const modelData = await ai.loadModel(path);
  return modelData
}

function sleep(ms) {
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


const postMessage = (e, data = false, currentIndex) => {
  _self.postMessage({
    type: e.data.type,
    id: e.data.id,
    data,
  })
}

_self.onmessage = async function (e) {

  // console.log(`${e.data.type}:`, e)
  switch (e.data.type) {
    case 'init':
      ai = new GameAITrainer(...e.data.data);
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
      const actionData = await selectAction(...e.data.data);
      postMessage(e, actionData);
      break;

    case 'recordExperience':
      pushExp(...e.data.data);
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
      storegeData = e.data.data;
      postMessage(e, true);
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
