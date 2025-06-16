import { getNsRandom, getUUID } from "../tool/utils";
import loadWss from "../effect/gamewss";

//角色，红黄蓝...(方)
export default class Role {
  constructor(info) {
    this._fraction = info._fraction || 2;
    this.blocks = info.blocks || [];
    this.name = info.name || Math.random() + '';
    this.isAction = info.isAction || false;
    this.color = info.color || [...this.backgroundColor.toSpliced(3, 1), 0.5];
    this.blocks[0].content = this._fraction;
    this.blocks[0].color = this.color;
    this.isRobot = info.isRobot || false;
    this.actionType = info.actionType || null;
    this.nextRole = info.nextRole;
    this.id = info.id || getUUID();
    this.localPlayer = info.localPlayer;
  }


  // fraction的getter和setter
  get fraction() {
    return this._fraction;
  }

  set fraction(value) {
    if (this.isAction) {
      const oldValue = this._fraction;
      this._fraction = value;
      if (oldValue == value) return
      if (value === 0) {
        this.nextRole?.('role');
        this.actionType = null;
        this.isAction = false;
      }
    }
  }

  attack() {
    this.isAction = true;
    this.actionType = 0;
  }

  attackComplete() {
    this.blocks.forEach(_ => _.selected = false);
    this.blocks.length && (this._fraction = this.blocks.length);
  }

  proliferationComplete() {
    let notMaxblocks = this.blocks.filter(_ => _.content < _.maxSize);
    while (notMaxblocks.length > 0 && this.fraction > 0) {
      notMaxblocks.forEach(_ => _.tryProliferation(1));
      notMaxblocks = this.blocks.filter(_ => _.content < _.maxSize);
      if (!notMaxblocks.length) { this.fraction = 0 }
    }
  }

  nextStep() {
    if (this.actionType === 0) {
      this.attackComplete();
      this.actionType = 1;
    } else if (this.actionType === 1) {
      this.proliferationComplete();
      this.actionType = null;
      this.isAction = false;
    } else {
      this.nextRole();
    }
    this.wsaction('nextstep');
  }

  getState() {
    return {
      name: this.name,
      fraction: this.fraction,
      isAction: this.isAction,
      actionType: this.actionType,
      color: `rgba(${this.color.join(',')})`
    }
  }

  removeBlock(block) {
    this.blocks = this.blocks.filter(_ => _ !== block);
  }

  wsaction(str) {
    if (this.localPlayer) {
      const gameWs = loadWss();
      gameWs.send(`${this.id}.${str}`)
    }
  }
}