import Dqn from './dqn';

export default class AdvancedPftAgent extends Dqn {
  constructor(game, config = { mapSize: 150, }) {
    super('AdvancedPftAgentModel', { ...config, characteristicSize: 14, actionSpaceSize: 150 });
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
          -1,// block.content,
          -1,//  block.isDisadvantaged ? 1 : 0,
          -1,
          -1, -1, -1, -1, -1, -1, // bf
          -1,
          -1,
          -1,
          -1 //剩余可用点点数
        );
        continue;
      }
      const isSee = block.neighbors.some(_ => _.belongsTo === role)
      if (isSee) { //可见
        const bfvalue = Array(6).fill(-1);
        block.neighborsPositionIndex.forEach((pos, i) => {
          bfvalue[pos] = block.neighbors[i].content;
        });
        const hasId = belongsToBlock.has(id);
        blockFeatures.push(
          hasId ? 1 : 0,
          block.content,
          block.isDisadvantaged ? 1 : 0,
          block.maxSize,
          ...bfvalue,
          block.point.relativeX,
          block.point.relativeY,
          1,
          hasId ? block.belongsTo.fraction : 0 //剩余可用点点数
        );
      } else { //不可见
        blockFeatures.push(
          belongsToBlock.has(id) ? 1 : 0,
          -1,// block.content,
          -1,//  block.isDisadvantaged ? 1 : 0,
          block.maxSize,
          -1, -1, -1, -1, -1, -1, // bf
          -1,
          -1,
          0,
          0 //剩余可用点点数
        );
      }
    }
    return blockFeatures.flat(Infinity);
  }

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
      effectiveness: nextValue.effectiveness - value.effectiveness,
    };
    let reward = Math.floor(rewardInfo.blockLength - rewardInfo.threat * 0.3 + rewardInfo.effectiveness * 0.3) > 0 ? 1 : -1;
    // console.log(rewardInfo, value, nextValue)
    // console.log(rewardInfo.blockLength - rewardInfo.threat * 0.3 + rewardInfo.effectiveness * 0.1)
    // reward += actionIsValidata ? 1 : -1;
    if (initialActionList.length === 1 && aiAction === -1) reward = reward >= 0 ? reward += 1 : 1;;
    if (reward > 0) this.accumulatedRewards += reward;
    else this.accumulatedPunishment += reward;
    return reward;
  }

  getAvailableActionList() {
    const role = this.game.roles[this.game.currentActionRole];
    const actionList = [-1];
    if (role.fraction > 0) {
      const _actionList = role.blocks.filter(_ => _.content < _.maxSize);
      return [...actionList, ..._actionList.map(_ => _.key)]
    }
    return actionList;
  }

  rewardIsDone() {
    const role = this.game.roles[this.game.currentActionRole];
    if (role.fraction === 0) {
      return true;
    }
    if (role.blocks.every(_ => _.content === 1)) {
      return true;
    }
    return false;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  randomAction() {
    const invalActionList = this.getAvailableActionList();
    const action = invalActionList[Math.floor(Math.random() * invalActionList.length)];
    let end;
    if (action !== -1) {
      end = this.game.aiBlocks[action].tryProliferation(1);
      // await this.sleep(10);
    };
    if (action === -1) return false
    return invalActionList.length !== 1;
  }

  async action() {
    // const role = this.game.roles[this.game.currentActionRole];
    const invalActionList = this.getAvailableActionList();
    const state = this.getGameState();
    const statusValue = this.getStatusValue(state);
    const { aiAction, actionType } = await this.gameAi.selectAction(state, invalActionList);
    const actionIsValidata = invalActionList.includes(aiAction);
    let end;
    if (actionIsValidata && aiAction !== -1) {
      end = this.game.aiBlocks[aiAction].tryProliferation(1);
      // await this.sleep(10);
    };
    let done = false;
    if (actionIsValidata.length === 1 && aiAction === -1) {
      done = true
    }
    const nextState = this.getGameState();
    const nextStatusValue = this.getStatusValue(nextState);
    const reward = this.getReward(statusValue, nextStatusValue, actionIsValidata, aiAction, invalActionList);
    if (reward > 0) this.accumulatedRewards += reward;
    else this.accumulatedPunishment += reward;
    await this.gameAi.recordExperience(aiAction, reward, state, nextState, done);
    actionType === 'ai' && console.log(`
----------Pft--------------
end: ${end}, 
reward:${reward},
type:${actionType},
aiAction: ${aiAction},
initialActionList: ${invalActionList.join('/')},
-----------------------
        `);
    if (aiAction === -1) return false
    return invalActionList.length !== 1;
  }

}

