import Game from '@/class/game';
import Dqn from './dqn';
import Block from '@/class/block';
import { IGetRewardValue } from '@/type/ai.type';

export default class AdvancedPftAgent extends Dqn {
  game: Game;
  static readonly PASS_ACTION = 150;
  constructor(game: Game, config = { mapSize: 150, }) {
    super('AdvancedPftAgentModel', { ...config, stateShape: 12 * 150 + 1, actionSpaceSize: 151 });
    this.game = game;
  }

  getGameState() {
    const role = this.game.roles[this.game.currentActionRole];
    const blockFeatures = [role.fraction];
    const blocks = new Array(150).fill(null) as Block[];
    const everyBlockHasRealIndex = this.game.blocks.every(_ => (typeof _?.realIndex === 'number' && !Number.isNaN(_?.realIndex) && _?.realIndex > -1));
    if (!everyBlockHasRealIndex) console.error("everyBlockHasRealIndex: ", everyBlockHasRealIndex)
    this.game.blocks.forEach(_ => blocks[_?.realIndex as number] = _);
    // 不足150时用0填充（保持固定输入长度）
    for (let index = 0; index < blocks.length; index++) {
      const block = blocks[index];
      if (!block) {
        blockFeatures.push(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,);
        continue;
      } else {
        const bfvalue = Array(6).fill(-1);
        block.neighborsPositionIndex.forEach((pos: number, i: number) => {
          bfvalue[pos] = block.neighbors[i].content;
        });
        blockFeatures.push(
          block.belongsTo === role ? 1 : 0, //是否被己方占领
          block.isDisadvantaged ? 1 : 0,
          block.content, //块大小，
          block.maxSize,
          ...bfvalue,
          block?.point?.relativeX,
          block?.point?.relativeY,
        );
      }
    }
    return blockFeatures.flat(Infinity);
  }

  getStatusValue(state: any) {
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

  getReward(value: IGetRewardValue, nextValue: IGetRewardValue, actionIsValidata: boolean, aiAction: number, initialActionList: (number | undefined)[]) {
    const rewardInfo = {
      blockLength: nextValue.blockLength - value.blockLength,
      threat: nextValue.threat - value.threat,
      effectiveness: (nextValue.effectiveness || 0) - (value.effectiveness || 0),
    };
    let reward = Math.floor(rewardInfo.blockLength - rewardInfo.threat * 0.3 + rewardInfo.effectiveness * 0.3) > 0 ? 1 : -1;
    // console.log(rewardInfo, value, nextValue)
    // console.log(rewardInfo.blockLength - rewardInfo.threat * 0.3 + rewardInfo.effectiveness * 0.1)
    // reward += actionIsValidata ? 1 : -1;
    if (initialActionList.length === 1 && aiAction === AdvancedPftAgent.PASS_ACTION) reward = reward >= 0 ? reward += 1 : 1;;
    if (reward > 0) this.accumulatedRewards += reward;
    else this.accumulatedPunishment += Math.abs(reward);
    return reward;
  }

  getAvailableActionList() {
    const role = this.game.roles[this.game.currentActionRole];
    const actionList = [AdvancedPftAgent.PASS_ACTION];
    if (role.fraction && role.fraction > 0) {
      const _actionList = role.blocks.filter(_ => _.content < _.maxSize);
      return [...actionList, ..._actionList.map(_ => _.realIndex)]
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

  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  randomAction() {
    const invalActionList = this.getAvailableActionList();
    const action = invalActionList[Math.floor(Math.random() * invalActionList.length)];
    let end;
    if (action !== AdvancedPftAgent.PASS_ACTION) {
      end = this.game.blocks[action]?.tryProliferation?.(1, 'train');
      // await this.sleep(10);
    };
    if (action === AdvancedPftAgent.PASS_ACTION) return false
    return invalActionList.length !== 1;
  }

  async action() {
    // const role = this.game.roles[this.game.currentActionRole];
    const invalActionList = this.getAvailableActionList();
    const state = this.getGameState();
    const statusValue = this.getStatusValue(state);
    const { aiAction, actionType } = await this.gameAi.selectAction({ state, initialActionList: invalActionList });
    const actionIsValidata: boolean = invalActionList.includes(aiAction);
    let end;
    if (actionIsValidata && aiAction !== AdvancedPftAgent.PASS_ACTION) {
      end = this.game.blocks[aiAction]?.tryProliferation(1, 'train');
      // await this.sleep(10);
    };
    let done = false;
    if (actionIsValidata && aiAction === AdvancedPftAgent.PASS_ACTION) {
      done = true
    }
    const nextState = this.getGameState();
    const nextStatusValue = this.getStatusValue(nextState);
    const reward = this.getReward(statusValue, nextStatusValue, actionIsValidata, aiAction, invalActionList);
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
    if (aiAction === AdvancedPftAgent.PASS_ACTION) return true // 結束選擇
    return invalActionList.length !== 1;
  }

}
