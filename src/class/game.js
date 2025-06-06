
import { renderHexagon } from "../tool/canvasUtils";
import Block from "./block";
// import EventEmitter from "./EventEmitter";
import { getDistance, getNsRandom, getLimitRandom, isEqual } from "../tool/utils";
import Role from "./role";
import AiAgent from '../QLearning'

const fMap = { 0: 1, 1: 2, 2: 0 }
const colorList = [
  [0, 119, 255],
  [255, 153, 0],
  [153, 51, 255]
]

// 添加一个绝对定位position数据
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
const gameConfig = {
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
//游戏主逻辑
export default class Game {
  constructor(ctx, releaseData) {
    this.ctx = ctx; //画布
    this.releaseData = releaseData;
    this.winRole = null;
    this.updataAiInfo = () => { };
    this.hitBlock = null;
    this.update = null;
    this.animation = false;
    this._winRole = null
    const initres = this.init();
    if (!initres) {
      this.error = '初始化失败，请检查窗口大小';
      releaseData({ error: this.error });
      return
    }
    this.ai = new AiAgent(this);
    this.renderCtx();
    this.startGame();
    this.eventClick = this.handleClick.bind(this);
    this.ctx.canvas.addEventListener('click', this.eventClick);
  }

  set winRole(value) {
    if (value) {
      this.updataState();
      this._winRole = value
    }
  }

  get winRole() {
    return this._winRole;
  }

  reset() {
    this.config = gameConfig;
    this.blockConfig = {
      color: [34, 34, 34, 1],
    };
    this.isStart = true; //游戏是否开始
    this.blocks = []; //游戏元素
    this.aiBlocks = [];
    this.currentActionRole = 0; //当前行动角色
    this.roles = []; //角色
    this.selectBlocks = [];
    this._winRole = null;
  }

  init() {
    this.reset();
    const randomEmpty = this.config.randomEmpty;
    const { centers } = renderHexagon(this.ctx, 50);
    if (centers.length < 40) {
      return false
    }
    this.aiBlocks = [];
    // 初始化block
    this.blocks = getAvailableBlock(centers).map((center, _key) => {
      const block = new Block(this.ctx, _key);
      block.init(center, this.blockConfig);
      this.aiBlocks.push(block);
      return block;
    }).filter(item => { return item.point.available && Math.random() > randomEmpty });
    // 生成随机地图//通过block之间的连线体现
    this.randomMap();
    //设置初始块
    this.config.blockInterval = (this.config.blockIntervalSeed - this.config.blockInterval) / this.blocks.length;
    //生成三个不同的随机数// 用作玩家起始位置
    const r = getNsRandom(3, 0, this.blocks.length - 1);
    this.roles = r.map((item, index) => {
      const role = new Role({
        block: [this.blocks[item]],
        name: `角色${index + 1}`,
        isRobot: true,
        color: colorList[index],
        nextRole: this.nextRole.bind(this)
      });
      this.blocks[item].belongsTo = role;
      return role;
    });
    // 设置block邻居的位置索引//可能会用做ai的状态输入的一部分
    this.blocks.forEach((block, index) => {
      block.initNeighborsPositionIndex();
    });
    this.winRole = null;
    // this.renderCtx();
    return true
  }
  // 绑定点击事件
  handleClick(event) {
    const rect = this.ctx.canvas.getBoundingClientRect();
    const clickInfo = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
    this.hitBlock = this.blocks.find(_ => _.isSelect(clickInfo))?.hit(this.hitBlock) || this.hitBlock;
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
  randomMap() {
    let startRandom = getLimitRandom(0, this.blocks.length, true);
    let startBlock = this.blocks[startRandom];
    let _findnei = this.findnei.bind(this);

    _findnei(startBlock);
    let newBlocks = this.blocks.filter(block => block.neighbors.length > 0);
    // 必须是可用地图
    if (newBlocks.length > (this.config.coverArea * this.blocks.length)) {
      newBlocks.forEach(block => {
        block.neighbors.forEach(nei => {
          if (!nei.neighbors.includes(block)) {
            nei.neighbors.push(block);
          } else if (!block.neighbors.includes(nei)) {
            block.neighbors.push(nei);
          }
        });

      });
      this.blocks = newBlocks
      return;
    }

    newBlocks = null;
    startRandom = null;
    startBlock = null;
    _findnei = null;
    this.blocks.forEach(block => { block.neighbors = []; block.visited = false });
    this.config.divisionContent = 0;
    this.randomMap();
  }
  // 是否有胜利者
  isWin() {
    const roles = this.roles.filter(_ => _.blocks.length > 0);
    if (roles.length > 1) {
      return null
    } else {
      return roles[0];
    }
  }

  // 向外界更新数据
  updataState() {
    const newDate = {
      currentRole: this.roles?.[this?.currentActionRole]?.getState(),
      isStart: this.isStart,
      winRole: this.winRole,
      animation: this.animation,
      roles: this.roles.map(_ => ({ name: _.name, color: _.color })),
      aiInfo: this?.ai?.getAiInfo?.()
    }
    if (!isEqual(newDate, this.update)) {
      this.update = newDate;
      this.releaseData(newDate)
    }
  }
  //渲染
  renderCtx() {

    setInterval(() => {
      if (this.isStart && this.blocks.length) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.blocks.forEach(_ => _.renderBlock(this.animation));
        this.updataState();
        this.winRole = this.isWin();
        // if (this.winRole) {
        //   return;
        // }
      }
    }, 1000);

    // requestAnimationFrame(this.renderCtx.bind(this));
  }
  // 下一步
  nextStep() {
    if (!this.isStart) {
      return;
    }
    this.roles?.[this?.currentActionRole]?.nextStep();
  }
  // 下一个角色行动
  nextRole(value) {
    this.currentActionRole += 1;
    if (this.currentActionRole >= this.roles.length) {
      this.currentActionRole = 0;
    }
    if (this.roles[this.currentActionRole].blocks.length <= 0) {
      return
    }
    this.roles[this.currentActionRole].attack();
  }
  // 更新ai数据
  setAiInfo(info) {
    this.animation = info.animation;
    this.ai.setAiInfo(info)
  }
  // 开始游戏
  startGame() {
    this.isStart = true;
    this.currentActionRole = 0;
    this.roles?.[this?.currentActionRole]?.attack();
  }
  // 新游戏
  newGame() {
    this.init();
    this.startGame();
  }
}