import Game from '@/class/game';
import AttackAgent from './advanced_attack_DQN'
import PftAgent from './advanced_pft_DQN';
import { IAiInfo } from '@/type/game.type';

export default class AiAgent {
  game: Game;
  attackRobot: AttackAgent;
  proliferationRobot: PftAgent;
  targetTrainNumber: number;
  currentTrainNumber: number;
  training: boolean;
  start: boolean;
  isInit: boolean;
  demonstrate: boolean | number;
  interval: number;
  timeId: any;
  renderTimeId: any;
  demonstrintervalate?: number;
  constructor(game: Game) {
    this.game = game;

    (window as any).game = game
    this.attackRobot = new AttackAgent(game); //进攻机器人 多少个角色就是多少个机器人
    this.proliferationRobot = new PftAgent(game); //加点机器人 多少个角色就是多少个机器人
    this.targetTrainNumber = 1000; // 对句数
    this.currentTrainNumber = 0; //
    this.training = false;
    // this.num = 0;
    this.start = false;
    this.isInit = false;
    this.demonstrate = false;
    this.interval = 1000;
    this.timeId = null;
    this.renderTimeId = null;
    this.loadConfig();
  }

  saveConfig() {
    localStorage.setItem("aiConfig", JSON.stringify({
      targetTrainNumber: this.targetTrainNumber,
      currentTrainNumber: this.currentTrainNumber,
      interval: this.interval,
      attackRobot: {
        accumulatedRewards: this.attackRobot.accumulatedRewards,
        accumulatedPunishment: this.attackRobot.accumulatedPunishment
      },
      proliferationRobot: {
        accumulatedRewards: this.proliferationRobot.accumulatedRewards,
        accumulatedPunishment: this.proliferationRobot.accumulatedPunishment
      }
    }))
  }

  loadConfig() {
    const configStr = localStorage.getItem('aiConfig');
    try {
      const { targetTrainNumber, currentTrainNumber, interval } = JSON.parse(configStr || "{}");
      this.targetTrainNumber = targetTrainNumber || this.targetTrainNumber;
      this.currentTrainNumber = currentTrainNumber || this.currentTrainNumber;
      this.interval = interval;

    } catch (error) {

    }
  }

  setInterval(type: number) {
    type > 0 ? (this.interval += 100) : (this.interval -= 100);
    if (this.demonstrate) {
      clearInterval(this.timeId);
      this.demonstrate = false;
      this.startDemonstrate();
    }
  }

  startDemonstrate() {
    if (this.demonstrate) {
      clearInterval(this.timeId);
      this.demonstrate = false;
      return
    }
    this.demonstrate = true;
    this.timeId = setInterval(() => {
      if (this.demonstrate === false) {
        clearInterval(this.timeId);
        return
      }
      this.stepTrain();
    }, this.interval);
  }

  setAiInfo(info: IAiInfo) {
    const { targetTrainNumber, currentTrainNumber, start, training, demonstrate, interval, } = info;
    this.targetTrainNumber = targetTrainNumber || this.targetTrainNumber;
    this.currentTrainNumber = currentTrainNumber || this.currentTrainNumber;
    this.start = start || this.start
    this.training = training || this.training
    this.demonstrate = demonstrate || this.demonstrintervalate || this.demonstrate;
    this.interval = interval || this.interval
    // this.attackRobot.setAiInfo(attackRobot);
    // this.proliferationRobot.setAiInfo(proliferationRobot);
  }

  getAiInfo() {
    return {
      targetTrainNumber: this.targetTrainNumber,
      currentTrainNumber: this.currentTrainNumber,
      start: this.start,
      training: this.training,
      demonstrate: this.demonstrate,
      interval: this.interval,
      attackRobot: {
        accumulatedRewards: this.attackRobot.accumulatedRewards,
        accumulatedPunishment: this.attackRobot.accumulatedPunishment,
      },
      proliferationRobot: {
        accumulatedRewards: this.proliferationRobot.accumulatedRewards,
        accumulatedPunishment: this.proliferationRobot.accumulatedPunishment,
      }
    }
  }

  initData() {
    this.game.newGame("train");
    this.game.roles[this.game.currentActionRole].attack();
    console.log("newGame")
  }

  paushTrain() {
    this.start = false;
    this.training = false;
    if (this.renderTimeId) {
      clearInterval(this.renderTimeId);
      this.renderTimeId = null;
    }
    try {

    } catch (error) {

    }
    // this.attackRobot.endTrainWorker();
    // this.proliferationRobot.endTrainWorker();
  }

  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  terminateWorker() {
    this.attackRobot.terminate();
    this.proliferationRobot.terminate();
  }

  async stepTrain() {
    if (this.training || this.start) return;
    if (!this.isInit) {
      // await Promise.all([this.attackRobot.initAi(), this.proliferationRobot.initAi()]);
      // await Promise.all([this.attackRobot.loadModel(), this.proliferationRobot.loadModel()])
      this.isInit = true
    }
    const role = this.game.roles[this.game.currentActionRole];
    let prtEnd;
    if (role.actionType === 0) {
      prtEnd = await this.attackRobot.randomAction();
      if (this.game.winRole) {
        this.initData();
        return
      }
    } else {
      prtEnd = await this.proliferationRobot.randomAction();
    }
    if (!prtEnd) {
      this.game.nextStep();
    }
  }

  async train(run: () => void) {
    if (this.training || this.start) return;
    if (!this.isInit) {
      await this.attackRobot.initAi();
      await this.attackRobot.loadModel();
      await this.proliferationRobot.initAi();
      await this.proliferationRobot.loadModel();
      this.isInit = true
    }

    // 模型初始化  &  加载已有模型
    if (this.renderTimeId) {
      clearInterval(this.renderTimeId);
    }
    this.renderTimeId = setInterval(() => { this.game.renderAllBlock() }, 1000)
    // 开始训练
    this.start = true;
    this.training = true;

    trainLoop:
    while (this.currentTrainNumber < this.targetTrainNumber) {
      this.attackRobot.gameAi.clearExp();
      this.proliferationRobot.gameAi.clearExp();
      this.currentTrainNumber++;
      this.initData();
      await this.sleep(1000)

      let times = Date.now();
      if (!this.start) break trainLoop;

      let initvali = false;
      let stepNum = 0;

      gameLoop:
      while (!this.game.winRole) {
        stepNum++;
        if (!this.start) break trainLoop;

        let attEnd = false;
        while (!attEnd) {
          if (!this.start) break trainLoop;

          attEnd = await this.attackRobot.action();
          this.game.winRole = this.game.isWin();
        }

        typeof run === "function" && run?.();
        this.game.nextStep();

        let prtEnd = true;
        while (!prtEnd) {
          if (!this.start) break trainLoop;
          prtEnd = await this.proliferationRobot.action();
        }

        // ===== 关键退出点 =====
        if ((Date.now() - times) > 10000 || stepNum > 2500) {
          console.log("无效数据")
          initvali = true;
          continue trainLoop; // 直接进入下一轮训练
        }

        typeof run === "function" && run?.();
      }

      try {
        await Promise.all([
          this.attackRobot.startTrainWorker(),
          this.proliferationRobot.startTrainWorker()
        ]);
      } catch (error) { }

      this.attackRobot.accumulatedPunishment = Math.floor(this.attackRobot.accumulatedPunishment);
      this.attackRobot.accumulatedRewards = Math.floor(this.attackRobot.accumulatedRewards);
      this.proliferationRobot.accumulatedPunishment = Math.floor(this.proliferationRobot.accumulatedPunishment);
      this.proliferationRobot.accumulatedRewards = Math.floor(this.proliferationRobot.accumulatedRewards);

      this.saveConfig();

      if (this.currentTrainNumber % 10 === 0) {
        await this.attackRobot.builderModel();
        await this.proliferationRobot.builderModel();
      }
    }

    this.training = false;
    if (this.renderTimeId) {
      clearInterval(this.renderTimeId);
      this.renderTimeId = null;
    }
  }


  getAction() {

  }
}
