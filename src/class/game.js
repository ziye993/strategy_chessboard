
import { renderHexagon } from "../tool/canvasUtils";
import Block from "./block";
import EventEmitter from "./EventEmitter";
import { getDistance, getNsRandom, getLimitRandom } from "../tool/utils";
import Role from "./role";
import QLearnings from "../QLearning";
import ProliferationQlearnins from "../QLearning/proliferation";
const fMap = { 0: 1, 1: 2, 2: 0 }

const getAvailableBlock = (block) => {
  const rendomNumber = 0;
  const newBlocks = [];
  block.forEach((item) => {
    if (item.relativeY % 2 === 0) {
      if ((item.relativeX - rendomNumber) % 3 === 0) {
        item.available = true;
        newBlocks.push(item);
      }

    } else {
      if ((item.relativeX - (fMap[rendomNumber])) % 3 === 0) {
        item.available = true;
        newBlocks.push(item);
      }

    }
  });
  const resBlocks = [];
  const tArr = new Array(newBlocks[newBlocks.length - 1].relativeY + 1).fill([]);

  newBlocks.forEach((item, index) => {
    tArr[item.relativeY] = [...tArr[item.relativeY], item]
  });
  tArr.forEach((item, y) => {
    item.forEach((v, x) => {
      v.positionX = x;
      v.positionY = y;
      resBlocks.push(v);
    });
  });
  return resBlocks;
}

//游戏主逻辑
export default class Game {
  constructor(ctx) {
    this.config = {
      blockInterval: 0.002,// 每次延申增加的概率
      blockSize: 50,// 块大小
      randomEmpty: 0.02,// 起始为空的概率
      blockDefaultSize: 50, //默认大小
      blockIntervalSeed: 0.7,//起始分裂概率
      currentBlockInterval: 0.002,//当前分裂概率
      divisionContent: 0,//分裂次数
      mapHeightSize: 1500,//地图高度
      mapWidthSize: 1500,//地图宽度
      coverArea: 0.8,
      lineColor: [255, 255, 255, 1],//线条颜色
    };
    this.blockConfig = {
      color: [34, 34, 34, 1],
    };
    this.isStart = false; //游戏是否开始
    this.round = 0; //游戏轮次
    this.blocks = []; //游戏元素
    this.currentActionRole = null; //当前行动角色
    this.roles = []; //角色
    this.ctx = ctx; //画布
    this.emitter = new EventEmitter();
    this.updateEvent = null;
    this.count = 1;
    this.selectBlocks = [];
    this.winRole = null;
    this.attackRobot = [];
    this.proliferationRobot = [];
    requestAnimationFrame(this.run.bind(this));
  }

  lineNei(block1, block2) {
    block1.neighbors.push(block2);
    block2.neighbors.push(block1)
  }

  reset() {
    this.config = {
      blockInterval: 0.002,// 每次延申增加的概率
      blockSize: 50,// 块大小
      randomEmpty: 0.02,// 起始为空的概率
      blockDefaultSize: 50, //默认大小
      blockIntervalSeed: 0.7,//起始分裂概率
      currentBlockInterval: 0.002,//当前分裂概率
      divisionContent: 0,//分裂次数
      mapHeightSize: 1500,//地图高度
      mapWidthSize: 1500,//地图宽度
      coverArea: 0.8,
      lineColor: [255, 255, 255, 1],//线条颜色
    };
    this.blockConfig = {
      color: [34, 34, 34, 1],
    };
    this.isStart = false; //游戏是否开始
    this.round = 0; //游戏轮次
    this.blocks = []; //游戏元素
    this.currentActionRole = null; //当前行动角色
    this.roles = []; //角色
    this.emitter = new EventEmitter();
    this.updateEvent = null;
    this.count = 1;
    this.selectBlocks = [];
    this.winRole = null;
  }

  init(isReset = false) {
    if (isReset) this.reset();
    const randomEmpty = this.config.randomEmpty;
    const { centers, length } = renderHexagon(this.ctx, 50);
    this.blocks = getAvailableBlock(centers).map(center => {
      const block = new Block(this.ctx, this);
      block.init(center, this.blockConfig);
      return block;
    }).filter(item => { return item.point.available && Math.random() > randomEmpty });
    //设置初始块
    this.config.blockInterval = (this.config.blockIntervalSeed - this.config.blockInterval) / this.blocks.length;
    this.blocks = this.findNeighbors();

    //生成三个不同的随机数
    const r = getNsRandom(3, 0, this.blocks.length - 1);
    this.roles = r.map((item, index) => {
      const role = new Role({
        block: [this.blocks[item]],
        name: `角色${index + 1}`,
        emitter: this.emitter,
        ctx: this.ctx,
        game: this,
        isRobot: true,
      })
      this.blocks[item].belongsTo = role;
      this.QLearnings = new QLearnings(this);
      this.proliferationRobot.push(new ProliferationQlearnins(this, role))
      return role;
    });
    this.blocks.forEach((block, index) => {
      block.initNeighborsPositionIndex();
      if (block.belongsTo) return;
      this.emitter.on('division', block.division.bind(block));
    });
  }

  endAction() {
    this.roles.forEach(role => { role.endAction() });
  }

  handleClick(event) {
    const rect = this.ctx.canvas.getBoundingClientRect();
    this.emitter.emit(['attacked', 'division', 'rolePointChange', 'pointProliferation', 'selecteds'], {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }, this.selectBlock);
  }
  // 查找邻居
  findnei(currentBlock) {
    currentBlock.visited = true;
    this.config.divisionContent += 1;
    let neis = [];
    this.blocks.forEach(block => { //
      if (block.id === currentBlock.id) {
        return;
      }
      const { x, y } = block.point;
      const dt = getDistance({ x, y }, { x: currentBlock.point.x, y: currentBlock.point.y });
      if (dt < (this.config.blockDefaultSize * 3.1)) {
        neis.push(block);
      }
    });
    neis = neis.filter(item => Math.random() < (this.config.blockIntervalSeed - (this.config.blockInterval * this.config.divisionContent)));
    if (neis.length <= 0) {
      return;
    }
    currentBlock.neighbors = [...new Set([...currentBlock.neighbors, ...neis])];
    neis = null;
    currentBlock.neighbors.forEach(block => {
      if (block.neighbors.includes(currentBlock) || block.visited) {
        return;
      }
      block.neighbors.push(currentBlock);
      return this.findnei.bind(this)(block);
    });
  }
  // 查找邻居
  findNeighbors() {
    let startRandom = getLimitRandom(0, this.blocks.length, true);
    let startBlock = this.blocks[startRandom];
    // startBlock.color = [255, 0, 0, 1]
    let _findnei = this.findnei.bind(this);
    _findnei(startBlock);

    let newBlocks = this.blocks.filter(block => block.neighbors.length > 0);
    if (newBlocks.length > (this.config.coverArea * this.blocks.length)) {
      newBlocks.forEach(block => {
        block.neighbors.forEach(nei => {
          if (!nei.neighbors.includes(block)) {
            nei.neighbors.push(block);
          } else if (!block.neighbors.includes(nei)) {
            block.neighbors.push(nei);
          }
          // if (!nei.neighbors.includes(block) || !block.neighbors.includes(nei)) {
          //   block.color=[255,0,0,1];
          //   nei.color=[255,0,0,1];
          // }
        });

      });
      return newBlocks;
    }

    newBlocks = null;
    startRandom = null;
    startBlock = null;
    _findnei = null;
    this.blocks.forEach(block => { block.neighbors = []; block.visited = false });
    this.config.divisionContent = 0;
    return this.findNeighbors();
  }

  // 游戏主循环
  run() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.blocks.forEach((block) => {
      block.renderBlock();
    });
    const loseRole = this.roles.find(role => role.blocks.length === 0);
    if (loseRole) {
      this.emitter.emit('lose', loseRole);
      this.emitter.clear(['attacked', 'division', 'rolePointChange', 'pointProliferation', 'selecteds']);
    }
    requestAnimationFrame(this.run.bind(this));
  }
  // 开始游戏
  start() {
    this.ctx.canvas.addEventListener('click', this.handleClick.bind(this));
    this.isStart = true;
    this.roles[0].startAction();
    this.currentActionRole = 0;
    this.updateEvent();
    this.updataEmitter();
    if (this.roles[this.currentRole].isRobot) {
      this.attackRobot.divisionAction();
      this.nextSetp()
    }
  }
  // 下一个角色行动
  nextRole() {    
    if (!this.isStart) {
      return;
    }
    this.currentActionRole += 1;
    if (this.currentActionRole >= this.roles.length) {
      this.currentActionRole = 0;
    }
    const nextRole = this.roles[this.currentActionRole];
    this.emitter.clear(['division', 'attacked', 'pointProliferation', 'selecteds']);
    this.blocks.forEach(block => {
      block.selected = false;
      if (!block.belongsTo) {
        this.emitter.on("division", block.division.bind(block))
      } else if (block.belongsTo && (block.belongsTo !== nextRole)) {
        this.emitter.on("attacked", block.attacked.bind(block))
      }
    });
    nextRole.startAction();
    this.updateEvent();
    if (this.roles[this.currentRole].isRobot) {
      this.attackRobot.divisionAction();
      this.nextSetp()
    }
  }
  // 下一个步骤
  nextSetp() {
    if (!this.isStart) {
      return;
    }
    if (this.roles[this.currentActionRole].isRobot) {

    }
    const lengthList = this.roles.filter(role => { return role.blocks.length !== 0 });
    console.log(lengthList, 'lengthList')
    if (lengthList.length === 1) {

      //win
      lengthList[0].win();
      return;
    }
    this.roles[this.currentActionRole].nextSetp();
  }
  //更新数据到外部
  update(event) {
    const self = this;
    this.updateEvent = () => {
      event(self)
    };
  }
  // 更新事件
  updataEmitter() {
    this.emitter.clear(['division', 'attacked', 'selecteds']);
    const currentRole = this.roles[this.currentActionRole];
    this.blocks.forEach((block, index) => {
      if (!block.belongsTo) {// 空板块
        this.emitter.on("division", block.division.bind(block));
      } else if (block.belongsTo && (block.belongsTo !== currentRole)) { //敌方板块
        this.emitter.on("attacked", block.attacked.bind(block))
      } else if (block.belongsTo === currentRole) {// 己方板块
        this.emitter.on("selecteds", block.selecteds.bind(block));
      }
    });
  }

  // 已经选择板块
  pushSelctBlockList(block) {
    if (this.selectBlocks.length < 2) {
      this.selectBlocks.push(block);
      return;
    }
    this.selectBlocks.push(block);
    this.selectBlocks.shift();
  }
}