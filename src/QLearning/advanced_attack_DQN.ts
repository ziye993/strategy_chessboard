import Game from '@/class/game';
import { padNumber } from '../tool/utils';
import Dqn from './dqn';
import { IGetRewardValue } from '@/type/ai.type';



export default class AdvancedAttackAgent extends Dqn {
  game: Game;
  accumulatedRewards: number;
  accumulatedPunishment: number;
  constructor(game: Game, config = { mapSize: 150, }) {

    super('AdvancedAttackAgentModel', { ...config, stateShape: 12 * 150, actionSpaceSize: 150150 });
    this.game = game;
    this.accumulatedRewards = 0;
    this.accumulatedPunishment = 0;
  }

  getGameState() {
    const role = this.game.roles[this.game.currentActionRole];
    const blockFeatures = [];
    const blocks = new Array(150).fill(null);
    const everyBlockHasRealIndex = this.game.blocks.every(_ => (typeof _?.realIndex === 'number' && !Number.isNaN(_?.realIndex) && _?.realIndex > -1));
    if (!everyBlockHasRealIndex) console.error("everyBlockHasRealIndex: ", everyBlockHasRealIndex)
    everyBlockHasRealIndex && this.game.blocks.forEach(_ => blocks[_?.realIndex as number] = _);
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
          block.point.relativeX,
          block.point.relativeY,
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

  getReward(value: IGetRewardValue, nextValue: IGetRewardValue, actionIsValidata: boolean, aiAction: number, initialActionList: number[]) {
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
            actionList.push(+`${__.index}.${padNumber(_.index + '', 3)}`)
          }
        })
      }
    });
    return [...new Set([...actionList])].map(_ => Number(_));
  }

  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  randomAction() {
    const initialActionList = this.getAvailableActionList();
    const action = initialActionList[Math.floor(Math.random() * initialActionList.length)];
    let end, foramtAction;
    if (action !== 0) {
      foramtAction = (action + '').split('.').map(_ => padNumber(_, 3));
      this.game.blocks[Number(foramtAction[0])]?.tryAttacked(this.game.blocks[Number(foramtAction[1])], "train");
    }
    if (action === 0) return false;
    return initialActionList.length !== 1;
  }


  async action() {
    const statusValue = this.getStatusValue();
    const state = this.getGameState();
    const initialActionList = this.getAvailableActionList();
    const { aiAction, actionType } = await this.gameAi.selectAction({ state, initialActionList });
    const actionIsValidata = initialActionList.includes(aiAction);
    let end, foramtAction;
    if (actionIsValidata && aiAction !== 0) {
      foramtAction = (aiAction + '').split('.').map(_ => padNumber(_, 3));
      end = this.game.blocks[Number(foramtAction[0])]?.tryAttacked(this.game.blocks[Number(foramtAction[1])],"train"); // ai'玩'游戏
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
    if (aiAction === 0) return true;  // 結束選擇
    return initialActionList.length !== 1;
  }

}