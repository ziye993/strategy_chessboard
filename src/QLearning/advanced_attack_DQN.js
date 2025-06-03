import { multiply, padNumber } from '../tool/utils';
import Dqn from './dqn';



export default class AdvancedAttackAgent extends Dqn {
  constructor(game, config = { mapSize: 150, }) {
    super('AdvancedAttackAgentModel', { ...config, characteristicSize: 13, actionSpaceSize: 150150 });
    this.game = game;
  }

  getGameState() {
    const role = this.game.roles[this.game.currentActionRole];
    const belongsToBlock = new Set(role.blocks.map(b => b.id));
    const blockFeatures = [];

    // 不足150时用0填充（保持固定输入长度）
    for (let id = 0; id < 150; id++) {
      const block = this.game.aiBlocks[id];
      if (!block) {
        blockFeatures.push(
          -1,
          -1,
          -1,
          -1,
          -1, -1, -1, -1, -1, -1, // bf
          -1,
          -1,
          -1,
        );
        continue;
      }
      const isSee = block.neighbors.some(_ => _.belongsTo === role)
      if (isSee) { //可见
        const bfvalue = Array(6).fill(-1); // 上 /右上/右/。。。 位置上的值，-1 表示没有
        block.neighborsPositionIndex.forEach((pos, i) => {
          bfvalue[pos] = block.neighbors[i].content;
        });
        blockFeatures.push(
          belongsToBlock.has(id) ? 1 : 0,
          block.content,
          block.isDisadvantaged ? 1 : 0,
          block.maxSize,
          ...bfvalue,
          block.point.relativeX,
          block.point.relativeY,
          1
        );
      } else { //不可见
        blockFeatures.push(
          belongsToBlock.has(id) ? 1 : 0,
          -1,// block.content,
          -1,//  block.isDisadvantaged ? 1 : 0,
          -1,
          -1, -1, -1, -1, -1, -1, // bf
          -1,
          -1,
          0
        );
      }
    }
    return blockFeatures.flat(Infinity);
  }

  // 获取某个状态的稳定性 越稳定，得分越高
  getStatusValue() {
    const role = this.game.roles[this.game.currentActionRole];
    const roleInfo = {
      blockLength: role.blocks.length,
      threat: role.blocks.reduce((_c, _v) => //威胁度
        _c += _v.neighbors.reduce((__c, __v) =>
          __c += (__v.belongsTo && __v.belongsTo !== role
            ? __v.content
            : 0
          )
          , 0) / _v.content
        , 0),
      effectiveness: role.blocks.reduce((_c, _v) => _c += _v.content, 0) / role.blocks.length, //战力值
      //其他指标暂定
    }
    return roleInfo
  }

  getReward(value, nextValue, actionIsValidata, aiAction, initialActionList) {
    const rewardInfo = {
      blockLength: nextValue.blockLength - value.blockLength,
      threat: nextValue.threat - value.threat,
      effectiveness: nextValue.threat - value.threat,
    };
    let reward = Math.floor(rewardInfo.blockLength - rewardInfo.threat * 0.3 + rewardInfo.effectiveness * 0.1) > 0 ? 1 : -1;
    //  console.log(rewardInfo.blockLength - rewardInfo.threat * 0.3 + rewardInfo.effectiveness * 0.1)
    // reward += actionIsValidata ? 1 : -1;
    if (initialActionList.length === 1 && aiAction === 0) reward = reward >= 0 ? reward += 1 : 1;
    if (reward > 0) this.accumulatedRewards += reward;
    else this.accumulatedPunishment += reward;
    return reward;
  }

  // 有效行动列
  getAvailableActionList() {
    const role = this.game.roles[this.game.currentActionRole];
    const actionList = [0];
    role.blocks.forEach(_ => {
      if (_.content >= 2) {
        _.neighbors.forEach(__ => {
          if (__.belongsTo !== _.belongsTo) {
            actionList.push(+`${__.key}.${padNumber(_.key + '', 3)}`)
          }
        })
      }
    });
    return [...new Set([...actionList])].map(_ => Number(_));
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  randomAction() {
    const initialActionList = this.getAvailableActionList();
    const action = initialActionList[Math.floor(Math.random() * initialActionList.length)];
    let end, foramtAction;
    if (action !== 0) {
      foramtAction = (action + '').split('.').map(_ => padNumber(_, 3));
      this.game.aiBlocks[Number(foramtAction[0])].tryAttacked(this.game.aiBlocks[Number(foramtAction[1])]);
    }
    if (action === 0) return false;
    return initialActionList.length !== 1;
  }


  async action() {
    const statusValue = this.getStatusValue();
    const state = this.getGameState();
    const initialActionList = this.getAvailableActionList();
    const { aiAction, actionType } = await this.gameAi.selectAction(state, initialActionList);
    const actionIsValidata = initialActionList.includes(aiAction);
    let end, foramtAction;
    if (actionIsValidata && aiAction !== 0) {
      foramtAction = (aiAction + '').split('.').map(_ => padNumber(_, 3));
      end = this.game.aiBlocks[Number(foramtAction[0])].tryAttacked(this.game.aiBlocks[Number(foramtAction[1])]); // ai'玩'游戏
    } else {
      foramtAction = [aiAction]
    }
    let done = false;
    if (this.game.winRole) {
      done = true
    }
    const nextStatusValue = this.getStatusValue();
    const nextState = this.getGameState();
    const reward = this.getReward(statusValue, nextStatusValue, actionIsValidata, aiAction, initialActionList);
    if (reward > 0) this.accumulatedRewards += reward;
    else this.accumulatedPunishment += reward;
    await this.gameAi.recordExperience(Number(foramtAction.join('')), reward, state, nextState, done);
    actionType === 'ai' && console.log(`
----------Attack--------------
end: ${end}, 
reward: ${reward},
type: ${actionType},
aiAction: ${foramtAction?.join?.('<=') || aiAction},
expAction: ${Number(foramtAction.join(''))}
initialActionList: ${initialActionList.join('/')},
-----------------------
        `)
    if (aiAction === 0) return false;
    return initialActionList.length !== 1;
  }

}