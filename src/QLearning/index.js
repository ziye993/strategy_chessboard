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

class QLearningDivisionAgent {
  // 初始化Q表，学习率，折扣因子，探索率等参数
  constructor(role, learningRate = 0.1, discountFactor = 0.9, epsilon = 1.0, epsilonDecay = 0.995, epsilonMin = 0.01) {
    // this.game = game;
    this.role = role;
    // this.actionSize = actionSize;
    this.learningRate = learningRate;
    this.discountFactor = discountFactor;
    this.epsilon = epsilon;
    this.epsilonDecay = epsilonDecay;
    this.epsilonMin = epsilonMin;

    // 初始化Q表为全0           邻居位置0                      邻居的值-14到14          行为0-6    行为的值
    // 创建 数组，分别表示六个邻居的值正数表示己方，负数表示敌方，0表示未占领，初始值为 0
    this.qTable = createNDArray(
      30,
      30,
      30,
      30,
      30,
      30, // 5
      14, //自己的值
      6, //行为
      0 //初始值
    );
  }

  // 根据当前状态选择动作（ε-贪心策略）
  act(state) {
    if (Math.random() < this.epsilon) {
      // 探索：随机选择动作
      return Math.floor(Math.random() * this.actionSize);
    } else {
      // 利用：选择Q值最大的动作
      const { neiValus } = state;
      return this.getBestAction(neiValus);
    }
  }

  // 获取给定状态下的最佳动作
  getBestAction(neis, currValue) {
    const actions = visitNDArray(this.qTable, ...neis, currValue);
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
  update(neis, action, reward, nextState,) {
    const { currValue, nei: nextNeis } = nextState;
    // Q学习更新公式
    const currentQ = visitNDArray(this.qTable, ...neis, action);
    const maxNextQ = Math.max(...visitNDArray(this.qTable, ...nextNeis, currValue));
    setNDArray(
      this.qTable,
      currentQ + this.learningRate * (reward + this.discountFactor * maxNextQ - currentQ),
      ...neis,
      action
    )
    // this.qTable[x][y][action] = currentQ + this.learningRate * (reward + this.discountFactor * maxNextQ - currentQ);

    // 衰减探索率
    if (this.epsilon > this.epsilonMin) {
      this.epsilon *= this.epsilonDecay;
    }
  }
}

export default class QLearnings {
  constructor(game, role) {
    this.game = game;
    this.role = role;
    this.QLearningAgents = new QLearningDivisionAgent(role); // this.game.roles.map(role => new QLearningDivisionAgent(role));
  }
  divisionAction(currentRole) {
    // const QLearningRole = this.QLearningAgents.find(role => role === currentRole);
    const actionBlcoks = currentRole.blocks.filter(block => block.content > 1 && block.neighbors.some(nei => nei.belongsTo !== block.belongsTo));
    for (let i = 0; i < actionBlcoks.length - 1; i++) {
      let currentBlock = actionBlcoks[i];
      while (currentBlock.content > 1) {
        let state = new Array(6).fill(29);
        for (let j = 0; j < currentBlock.neighborsPositionIndex.length; j++) {
          const element = currentBlock.neighborsPositionIndex[j];
          if (element.belongsTo !== currentBlock.belongsTo) {
            state[element] = valueMap[-currentBlock.neighbors[j].content];
          } else {
            state[element] = valueMap[currentBlock.neighbors[j].content];
          }
        }
        const action = this.QLearningRole.act(state, currentBlock.content);
        const { reward, nextState, isDone } = this.nextStep(action, currentBlock);
        this.agent.update(state, action, reward, nextState, isDone);
      }
      currentBlock = actionBlcoks[i];
    }
  }
  //下一步状态
  nextStep(action, currentBlock) {
    const nextBlock = currentBlock.neighborsPositionIndex.find(item => item === action);
    if (nextBlock) {
      //                        攻击者          被攻击者
      this.game.selectBlocks = [currentBlock, nextBlock];
      const nextBelongsTo = nextBlock.belongsTo;
      nextBlock.robotDivision(currentBlock);
      let reward = 0;

      if (nextBlock.belongsTo === currentBlock.belongsTo) { //进攻胜利
        reward = 1
      } else { // 进攻失败
        reward = -1;
      }
      if (nextBelongsTo.blocks.length === 0) {
        reward = 50;
      }
      if (this.game.roles.every(role => role.blocks.length === 0)) {
        reward += 50;
      }
      return {
        nextState: {
          reward,
          nextState: {
            nei: nextBlock.neighborsPositionIndex,
            currValue: nextBlock.content
          },
        }
      }
    } else {
      return {
        nextState: {
          reward: -1,
          nextState: {
            nei: nextBlock.neighborsPositionIndex,
            currValue: nextBlock.content
          },
        }
      }
    }


  }
  retQtable() {
    console.log(this.QLearningAgents);
    return this.QLearningAgents;
  }
}



// 训练Q-Learning智能体