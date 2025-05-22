import { getNsRandom } from "../tool/utils";

//角色，红黄蓝...(方)
export default class Role {
  constructor(info) {
    this.game = info.game;
    this.fraction = 2;
    this.blocks = info.block || [];
    this.name = info.name || Math.random() + '';
    this.action = false;
    this.emitter = info.emitter;
    this.action = false;
    this.backgroundColor = [...getNsRandom(3, 0, 255), 1];
    this.color = [...this.backgroundColor.toSpliced(2, 1), 0.5];
    this.linghColor = [...this.backgroundColor.toSpliced(2, 1), 1];
    info.block[0].content = this.fraction;
    this.fraction = 0;
    info.block[0].color = this.color;
    this.ctx = info.ctx;
    this.timeId = null;
    this.roundTime = 60;
    this.currentStep = 0;
    this.isRobot = info.isRobot || false;
  }

  startAction() { //开始行动
    if (this.blocks.length === 0) {  //结束
      this.proliferationEnd();
    }
    this.currentStep = 0;
    this.action = true;
    this.blocks.forEach(block => {
      this.emitter.on("selecteds", block.selecteds.bind(block));
    });
  }

  endAction() { //结束行动
    this.currentStep += 1;
    this.roundTime = 30;
    clearInterval(this.timeId);
    this.emitter.clear(['division']);
    this.startProliferation();
    this.fraction += this.blocks.length;
    this.game.updateEvent();
  }

  startProliferation() {
    this.blocks.forEach(block => {
      this.emitter.on("pointProliferation", block.pointProliferation.bind(block));
    });

  }

  proliferationEnd() {
    const newblocks = this.blocks.filter(block => !block.contentIsMax);
    // this.blocks = newblocks;
    if (this.fraction > 0 && newblocks.length > 0) {
      let i = 0;
      while (this.fraction > 0) {
        newblocks[i].proliferation();
        console.log(newblocks, i)
        if (newblocks[i].contentIsMax) {
          newblocks.splice(i, 1);
        }
        if (newblocks.length === 0) {
          break;
        }
        i++;//i不可能大于blocks.length
        if (i >= newblocks.length) {
          i = 0;
        }
      }
    }
    this.fraction = 0;
    this.action = false;
    this.emitter.clear(['pointProliferation', 'division', 'attacked', 'selecteds']);
    this.game.nextRole();
    this.game.updateEvent();
  }

  nextSetp() {
    if (this.currentStep === 0) {
      this.endAction();
    } else if (this.currentStep === 1) {
      this.proliferationEnd();
    }
    this.game.updateEvent();
  }

  win() {
    console.log("胜利")
    this.game.isStart = false;

  }

}