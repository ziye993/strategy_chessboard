import { createNDArray, visitNDArray, setNDArray } from '../tool/utils';

// Q-Learning智能体
const valueMap = {
  '-14': 0,
  '-13': 1,
  '-12': 2,
  '-11': 3,
  '-10': 4,
  '-9': 5,
  '-8': 6,
  '-7': 7,
  '-6': 8,
  '-5': 9,
  '-4': 10,
  '-3': 11,
  '-2': 12,
  '-1': 13,
  '0': 14,
  '1': 15,
  '2': 16,
  '3': 17,
  '4': 18,
  '5': 19,
  '6': 20,
  '7': 21,
  '8': 22,
  '9': 23,
  '10': 24,
  '11': 25,
  '12': 26,
  '13': 27,
  '14': 28,
  'null': 29,
}

class QLearningProliferationAgent {
  constructor(learningRate = 0.1, discountFactor = 0.9, epsilon = 1.0, epsilonDecay = 0.995, epsilonMin = 0.01) {
    // this.game = game;
    // this.role = role;
    // this.actionSize = actionSize;
    this.learningRate = learningRate;
    this.discountFactor = discountFactor;
    this.epsilon = epsilon;
    this.epsilonDecay = epsilonDecay;
    this.epsilonMin = epsilonMin;

    // 初始化Q表为全0           邻居位置0-邻居的值-14到14     行为0-13    行为的值
    // 创建 数组，分别表示六个邻居的值正数表示己方，负数表示敌方，0表示未占领，初始值为 0// 行为表示：1：加一点 0 不加点
    this.qTable = createNDArray(
      30, // 1
      30, // 2
      30, // 3
      30, // 4
      30, // 5
      30, // 6
      14, //自己的值
      3, //最大值类型
      14, //行为
      0);
  }

  // 根据当前状态选择动作（ε-贪心策略）
  act(state, currentValue) {
    if (Math.random() < this.epsilon) {
      // 探索：随机选择动作
      return Math.floor(Math.random() * this.actionSize);
    } else {
      // 利用：选择Q值最大的动作
      const { neiValus } = state;
      return this.getBestAction(neiValus, currentValue);
    }
  }

  // 获取给定状态下的最佳动作
  getBestAction(state, currValue) {
    const actions = visitNDArray(this.qTable, ...state, currValue);
    let bestAction = 0;
    let bestValue = actions[0];

    for (let i = 1; i < actions.length; i++) {
      if (actions[i] > bestValue) {
        bestValue = actions[i];
        bestAction = i;
      }
    }
    return bestAction;
  }

  // 更新Q表 参数：当前状态，动作，奖励，下一个状态，是否完成
  update(state, action, reward, nextState) {
    // Q学习更新公式
    const currentQ = visitNDArray(this.qTable, ...state, action);
    const maxNextQ = Math.max(...visitNDArray(this.qTable, ...nextState));
    setNDArray(
      this.qTable,
      currentQ + this.learningRate * (reward + this.discountFactor * maxNextQ - currentQ),
      ...state,
      action
    )
    if (this.epsilon > this.epsilonMin) {
      this.epsilon *= this.epsilonDecay;
    }
  }
}

export default class ProliferationQlearnins {
  constructor(game, role) {
    this.game = game;
    this.role = role;
    // this.fraction = game.fraction;
    this.dangerousness = 0;
    this.QLearningAgents = new QLearningProliferationAgent(); //this.game.roles.map(role => new QLearningProliferationAgent(role));
  }
  restart(game, role) {
    this.game = game;
    this.role = role;
  }

  //训练
  divisionAction() {
    const actionBlcoks = this.QLearningRole.blocks; // currentRole.blocks.filter(block => block.content > 1 && block.neighbors.some(nei => nei.belongsTo !== block.belongsTo));
    for (let i = 0; i < actionBlcoks.length - 1; i++) {
      let currentBlock = actionBlcoks[i];
      while (currentBlock.content > 1) {
        let state = new Array(6).fill(0);
        for (let j = 0; j < currentBlock.neighborsPositionIndex.length; j++) {
          const element = currentBlock.neighborsPositionIndex[j];
          if (element.belongsTo !== currentBlock.belongsTo) {
            state[element] = valueMap[-currentBlock.neighbors[j].content];
          } else {
            state[element] = valueMap[currentBlock.neighbors[j].content];
          }
        }
        const action = this.QLearningRole.act(state, currentBlock.content, currentBlock.maxType);
        const { reward, nextState } = this.nextStep(action, currentBlock);
        this.agent.update(state, action, reward, nextState);
      }
      currentBlock = actionBlcoks[i];
    }
  }

  getDangerousness(currentBlock) {
    let dangerousness = 0;
    let porf = 0;
    this.game.roles.forEach(role => {
      role.blocks.forEach(block => {
        if (block.belongsTo !== currentBlock.belongsTo) {
          dangerousness += block.content;
        }
      })
    });
    currentBlock.neighbors.forEach(nei => {
      if (nei.belongsTo !== currentBlock.belongsTo) {
        dangerousness += nei.content;
      }
      if (!nei.belongsTo) {
        porf = 1;
      }
    });
    if (currentBlock.content > 1) {
      dangerousness -= porf;
    }
    return dangerousness;
  }
  //下一步状态
  nextStep(action, currentBlock) {
    //使用危险性来评判奖励
    let reward = 0;

    //未行动时危险性
    const afterDangerousness = this.getDangerousness(currentBlock);
    currentBlock.proliferation(action);
    const beforeDangerousness = this.getDangerousness(currentBlock);
    reward = beforeDangerousness - afterDangerousness;
    return {
      reward,
      nextState: [
        ...currentBlock.neighborsPositionIndex,
        currentBlock.content,
        currentBlock.maxType,
      ],
    }

  }
  retQtable() {
    console.log(this.QLearningAgents);
    return this.QLearningAgents;
  }
}