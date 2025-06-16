
import { getHexagonCenters, getVertexs } from "../tool/canvasUtils";
import Block from "./block";
// import EventEmitter from "./EventEmitter";
import { getDistance, getNsRandom, getLimitRandom, isEqual, getUUID } from "../tool/utils";
import Role from "./role";
import AiAgent from '../QLearning'

const gameConfig = {
  branchProbability: 0.9,// 产生分支概率
  branchAttenuation: 0.997, //产生分支衰减
  blockSize: 50, // 块大小，
  effectiveBlockAtt: 0.5,
  notNullBlockProb: 0.85, //初始不空概率·
  colors: {
    '清新简约风': [[176, 224, 230, 1], [152, 251, 152, 1], [255, 204, 204, 1]],
    '科技未来风': [[75, 0, 130, 1], [100, 149, 237, 1], [186, 85, 211, 1]],
  }
};

const gearContent = {
  1: 6,
  2: 6,
  3: 10,
  4: 10,
  5: 14,
  6: 6,
  7: 14,
}


function initNeighborsPositionIndex(block) {
  return block.neighbors.map(item => {
    // case循环
    switch (true) {
      case (item.point.x === block.point.x && item.point.y < block.point.y): return 0;
      case (item.point.x > block.point.x && item.point.y < block.point.y): return 1;
      case (item.point.x > block.point.x && item.point.y > block.point.y): return 2;
      case (item.point.x === block.point.x && item.point.y > block.point.y): return 3;
      case (item.point.x < block.point.x && item.point.y > block.point.y): return 4;
      case (item.point.x < block.point.x && item.point.y < block.point.y): return 5;
      default: return -1;
    }
  })
}

function objCopy(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export default class Game {
  constructor(ctx, initData, id) {
    this.ctx = ctx; //画布
    this.releaseData = null;
    this.winRole = null;
    this.hitBlock = null;
    this.update = null;
    this.animation = false;
    this._winRole = null
    this.ai = new AiAgent(this);
    this.eventClick = this.handleClick.bind(this);
    this.mapSize = initData.mapSize;
    this.gameType = initData.gametype;
    this.aiBlocks = [];
    this.blocks = [];
    this.currentActionRole = 0;
    this.locaPlayerId = id;
    this.init(initData);
    this.needHandleClickEvent()

  }
  canvasInit(mapWidth, mapHeight) {
    this.ctx.canvas.width = mapWidth;
    this.ctx.canvas.height = mapHeight;
  }

  blockInit(centers) {
    const defaultBlock = {
      neighbors: [],
      neighborsPositionIndex: [],
    };
    this.blocks = this.connectingSections(centers.map((center, _key) => ({ ...defaultBlock, realIndex: _key, point: { ...center } })))
      .map((_) => {
        const maxSize = gearContent[Math.floor(Math.random() * 3) + 1];
        const pointSize = gameConfig.blockSize - (10 - maxSize) * (3 - maxSize / 5)
        return new Block(this.ctx, {
          ..._,
          id: getUUID(),
          maxSize,
          point: {
            ..._.point,
            size: pointSize,
            ...getVertexs({ x: _.point.x, y: _.point.y, size: pointSize }),
          },
          neighborsPositionIndex: initNeighborsPositionIndex(_)
        });
      })
    const blocksMap = this.blocks.reduce((currentvalue, _) => ({ ...currentvalue, [_.realIndex]: _ }), {});
    this.blocks.forEach((_, _index) => {
      _.neighbors = _.neighbors.map(__ => blocksMap[__.realIndex]);
    });
  }

  initMapToData(_blocks, roles) {
    const blocks = _blocks.map((_) => {
      return new Block(this.ctx, {
        ..._,
      });
    })
    const blocksMap = blocks.reduce((currentvalue, _) => ({ ...currentvalue, [_.id]: _ }), {});
    this.blocks = blocks.map((_, _index) => {
      _.neighbors = _.neighbors.map(__ => blocksMap[__]);
      _.realIndex = _index;
      return _
    });
    const self = this;
    this.roles = roles.map(_ => {
      console.log(this.locaPlayerId, _.id, this.locaPlayerId === _.id)
      const role = new Role({
        ..._,
        blocks: _.blocks.map(__ => blocksMap[__]),
        nextRole: this.nextRole.bind(self),
        localPlayer: this.locaPlayerId === _.id,
        name: _.name || _.id
      });
      role.blocks.forEach(_block => _block.belongsTo = role);
      if (this.gameType === 'local') {
        role[0].id = this.locaPlayerId;
      }
      return role
    });
  }
  initMapToRandom(row, lin) {
    this.id = getUUID();
    const { centers, maxWidth: mapWidth, maxHeight: mapHeight, padding: canvasPadding } = getHexagonCenters(row, lin, gameConfig.blockSize);
    this.canvasInit(mapWidth, mapHeight);
    this.canvasPadding = canvasPadding;
    this.mapHeight = mapHeight;
    this.mapWidth = mapWidth;
    this.blockInit(centers);
    this.roleInit();

  }

  roleInit() {
    const r = getNsRandom(3, 0, this.blocks.length - 1);
    const self = this;
    this.roles = r.map((item, index) => {
      const role = new Role({
        blocks: [this.blocks[item]],
        name: `角色${index + 1}`,
        isRobot: true,
        color: gameConfig.colors['清新简约风'][index],
        nextRole: this.nextRole.bind(self),
        localPlayer: false
      });
      this.blocks[item].belongsTo = role;
      return role;
    });
  }

  saveMap(other = {}) {
    const id = this.id;
    const mapData = {
      canvasPadding: this.canvasPadding,
      mapHeight: this.mapHeight,
      mapWidth: this.mapWidth,
      mapSize: this.mapSize,
      ...other,
      blocks: this.blocks.map(_ => ({
        realIndex: _.realIndex,
        id: _.id,
        _content: _._content,
        point: _.point,
        maxSize: _.maxSize,
        belongsTo: _?.belongsTo?.id,
        neighbors: _.neighbors.map(_nei => _nei.id),
        neighborsPositionIndex: _.neighborsPositionIndex,
        isDisadvantaged: _.isDisadvantaged,

      })),
      roles: this.roles.map(_ => ({
        id: _.id,
        _fraction: _._fraction,
        blocks: _.blocks.map(_block => _block.id),
        name: _.name,
        isAction: _.isAction,
        backgroundColor: _.backgroundColor,
        color: _.color,
        linghColor: _.linghColor,
        isRobot: _.isRobot,
        actionType: _.actionType,
      })),
      id,
    }
    try {
      const mapList = JSON.parse(localStorage.getItem("mapList")) || [];
      mapList.push(id);
      localStorage.setItem('mapList', JSON.stringify(mapList));
      localStorage.setItem(id, JSON.stringify(mapData));
    } catch (error) {

    }
  }

  deleteMap(id) {
    try {
      let mapList = JSON.parse(localStorage.getItem("mapList")) || [];
      mapList = mapList.filter(_ => _ !== id);
      localStorage.setItem('mapList', JSON.stringify(mapList));
      localStorage.removeItem(id);
    } catch (error) {

    }
  }

  loadMap(id) {
    try {
      const mapData = JSON.parse(localStorage.getItem("mapList"));
      this.initData(mapData)
    } catch (error) {

    }
  }

  init(initData) {
    const { blocks, roles, canvasPadding = 100, mapHeight, mapWidth } = initData;
    if (blocks && roles && canvasPadding && mapHeight && mapWidth) {
      this.initMapToData(initData.blocks, initData.roles);
      this.canvasInit(mapWidth, mapHeight);
    } else {
      this.initMapToRandom(initData.mapSize, initData.mapSize);
    }
    this.winRole = null;
    this.blocks.forEach(_ => { _.renderBlock() })
    this.startGame();
    this.renderCtx();
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

  // 查找邻居/随机地图
  connectingSections(_centers) {

    const centers = [..._centers.map(_ => ({ ..._, allNei: [] }))]
    let originBlock = [...centers];
    let startRandom = getLimitRandom(0, originBlock.length, true);
    let startBlock = originBlock[startRandom];
    while (originBlock.length / centers.length < gameConfig.notNullBlockProb) {
      originBlock = centers.filter(_ => Math.random() < gameConfig.notNullBlockProb);
    }
    for (let i = 0; i < originBlock.length; i++) {
      for (let j = 0; j < originBlock.length; j++) {
        const { x, y } = originBlock[i].point;
        const { x: eachx, y: eachy } = originBlock[j].point;
        const dt = getDistance({ x, y }, { x: eachx, y: eachy });
        if (dt < (gameConfig.blockSize * 3.1) && originBlock[i].realIndex !== originBlock[j].realIndex) {
          originBlock[i].allNei.push(originBlock[j])
        }
      }
    }

    // 查找邻居
    function _findnei(currentBlock, ba) {
      if (currentBlock.visited) {
        return
      }
      currentBlock.visited = true;
      // divisionContent += 1; // 越到后面 分支越少
      const neis = getNsRandom(Math.ceil(Math.random() * currentBlock.allNei.length * ba), 0, currentBlock.allNei.length, true).map(_ => currentBlock.allNei[_]);
      if (neis.length !== 0) {
        currentBlock.neighbors = [...(new Set([...currentBlock.neighbors, ...neis]))];
        currentBlock.neighbors.forEach(block => {
          _findnei(block, ba * gameConfig.branchAttenuation);
        });
      }
    }

    let isAvailable = false;

    while (isAvailable === false) {
      _findnei(startBlock, gameConfig.branchProbability);
      // 必须是可用地图
      originBlock.forEach(block => {
        block.neighbors.forEach(nei => {
          if (!nei.neighbors.includes(block)) {
            nei.neighbors.push(block);
          } else if (!block.neighbors.includes(nei)) {
            block.neighbors.push(nei);
          }
        });
      });
      const resBlock = originBlock.filter(block => block.neighbors.length > 0);
      if ((resBlock.length / centers.length) > gameConfig.effectiveBlockAtt) {
        isAvailable = true
        return resBlock;
      }
      originBlock.forEach(_ => { _.neighbors = []; _.visited = false })
    }
    return [];
  }

  // 是否有胜利者aaa
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
      gameType: this.gameType,
      isStart: this.isStart,
      winRole: this.winRole,
      animation: this.animation,
      roles: this.roles.map(_ => ({ name: _.name, color: _.color })),
      aiInfo: this?.ai?.getAiInfo?.()
    }
    // this?.releaseData?.(newDate)
    // console.log(isEqual(newDate, this.update))
    // 
    if (!isEqual(newDate, this.update) && this?.releaseData) {
      console.log(this.update, newDate)
      this.update = newDate;
      this?.releaseData?.(newDate);
    }
  }
  //渲染
  renderCtx() {
    if (this.isStart && this.blocks.length) {
      this.updataState();
      this.winRole = this.isWin();
    }
    requestIdleCallback(this.renderCtx.bind(this));
  }
  // 下一步
  nextStep() {
    if (!this.isStart) {
      return;
    }
    this.roles?.[this?.currentActionRole]?.nextStep();
    this.needHandleClickEvent();
  }
  // 下一个角色行动
  nextRole() {

    this.currentActionRole += 1;
    if (this.currentActionRole >= this.roles.length) {
      this.currentActionRole = 0;
    }
    if (this.roles[this.currentActionRole].blocks.length <= 0) {
      return
    }
    this.roles[this.currentActionRole].attack();
    this.needHandleClickEvent();
  }
  // 更新ai数据
  setAiInfo(info) {
    this.animation = info.animation;
    this.ai.setAiInfo(info)
  }

  needHandleClickEvent() {
    this.ctx.canvas.removeEventListener('click', this.eventClick);
    if (this.roles[this.currentActionRole].id === this.locaPlayerId) {
      this.ctx.canvas.addEventListener('click', this.eventClick);
    }
  }
  // 开始游戏
  startGame() {
    this.isStart = true;
    this.currentActionRole = 0;
    this.roles?.[this?.currentActionRole]?.attack();
  }
  // 新游戏
  newGame() {
    if (this.gameType === 'line') {
      return
    }
    this.init();
    this.startGame();
    this.needHandleClickEvent()
  }

  playerAction(actionStr = "") {
    const actionInfoList = actionStr.split('.');
    if (actionInfoList[2] === 'disconnect') {
      console.log(`${actionInfoList[0]} 离线`);
      return
    }
    const actionPlayerId = actionInfoList[1];
    const role = this.roles[this.currentActionRole];
    if ((role.id + '') !== (actionPlayerId + '')) {
      console.log('错误数据： ', actionStr)
      return
    }
    const type = actionInfoList?.[2];
    const actionInfo = actionInfoList.splice(2);
    const blocksMap = this.blocks.reduce((currvalue, _) => ({ ...currvalue, [_.id]: _ }), {});
    switch (type) {
      case 'proliferation':
        blocksMap[actionInfo[1]].tryProliferation(1);
        break
      case 'attacked':
        blocksMap[actionInfo[1]].tryAttacked(blocksMap[actionInfo[2]]);
        break;
      case 'nextstep':
        this.nextStep();
        break;
      default:
        break;
    }
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
}




// //游戏主逻辑
// export default class Game {
//   constructor(ctx, releaseData) {
//     this.ctx = ctx; //画布
//     this.releaseData = releaseData;
//     this.winRole = null;

//     this.hitBlock = null;
//     this.update = null;
//     this.animation = false;
//     this._winRole = null
//     const initres = this.init();
//     if (!initres) {
//       this.error = '初始化失败，请检查窗口大小';
//       releaseData({ error: this.error });
//       return
//     }
//     this.ai = new AiAgent(this);
//     this.renderCtx();
//     this.startGame();
//     this.eventClick = this.handleClick.bind(this);
//     this.ctx.canvas.addEventListener('click', this.eventClick);
//   }

//   set winRole(value) {
//     if (value) {
//       this.updataState();
//       this._winRole = value
//     }
//   }

//   get winRole() {
//     return this._winRole;
//   }

//   reset() {
//     this.config = gameConfig;

//     this.isStart = true; //游戏是否开始
//     this.blocks = []; //游戏元素
//     this.aiBlocks = [];
//     this.currentActionRole = 0; //当前行动角色
//     this.roles = []; //角色
//     this.selectBlocks = [];
//     this._winRole = null;
//   }

//   init() {
//     this.reset();
//     const randomEmpty = this.config.randomEmpty;
//     const { centers } = getHexagonCenters(wl, hl, 50);
//     if (centers.length < 40) {
//       return false
//     }
//     this.aiBlocks = [];
//     // 初始化block
//     this.blocks = getAvailableBlock(centers).map((center, _key) => {
//       const block = new Block(this.ctx, _key);
//       block.init(center);
//       this.aiBlocks.push(block);
//       return block;
//     }).filter(item => { return item.point.available && Math.random() > randomEmpty });
//     // 生成随机地图//通过block之间的连线体现
//     this.randomMap();
//     //设置初始块
//     this.config.blockInterval = (this.config.blockIntervalSeed - this.config.blockInterval) / this.blocks.length;
//     //生成三个不同的随机数// 用作玩家起始位置
//     const r = getNsRandom(3, 0, this.blocks.length - 1);
//     this.roles = r.map((item, index) => {
//       const role = new Role({
//         block: [this.blocks[item]],
//         name: `角色${index + 1}`,
//         isRobot: true,
//         color: colorList[index],
//         nextRole: this.nextRole.bind(this)
//       });
//       this.blocks[item].belongsTo = role;
//       return role;
//     });
//     // 设置block邻居的位置索引//可能会用做ai的状态输入的一部分
//     this.blocks.forEach((block, index) => {
//       block.initNeighborsPositionIndex();
//     });
//     this.winRole = null;
//     // this.renderCtx();
//     return true
//   }
//   // 绑定点击事件
//   handleClick(event) {
//     const rect = this.ctx.canvas.getBoundingClientRect();
//     const clickInfo = {
//       x: event.clientX - rect.left,
//       y: event.clientY - rect.top,
//     }
//     this.hitBlock = this.blocks.find(_ => _.isSelect(clickInfo))?.hit(this.hitBlock) || this.hitBlock;
//   }
//   // 查找邻居
//   findnei(currentBlock) {
//     currentBlock.visited = true;
//     this.config.divisionContent += 1;
//     let neis = [];
//     this.blocks.forEach(block => { //
//       if (block.id === currentBlock.id) {
//         return;
//       }
//       const { x, y } = block.point;
//       const dt = getDistance({ x, y }, { x: currentBlock.point.x, y: currentBlock.point.y });
//       if (dt < (this.config.blockDefaultSize * 3.1)) {
//         neis.push(block);
//       }
//     });
//     neis = neis.filter(item => Math.random() < (this.config.blockIntervalSeed - (this.config.blockInterval * this.config.divisionContent)));
//     if (neis.length <= 0) {
//       return;
//     }
//     currentBlock.neighbors = [...new Set([...currentBlock.neighbors, ...neis])];
//     neis = null;
//     currentBlock.neighbors.forEach(block => {
//       if (block.neighbors.includes(currentBlock) || block.visited) {
//         return;
//       }
//       block.neighbors.push(currentBlock);
//       return this.findnei.bind(this)(block);
//     });
//   }
//   // 查找邻居
//   randomMap() {
//     let startRandom = getLimitRandom(0, this.blocks.length, true);
//     let startBlock = this.blocks[startRandom];
//     let _findnei = this.findnei.bind(this);

//     _findnei(startBlock);
//     let newBlocks = this.blocks.filter(block => block.neighbors.length > 0);
//     // 必须是可用地图
//     if (newBlocks.length > (this.config.coverArea * this.blocks.length)) {
//       newBlocks.forEach(block => {
//         block.neighbors.forEach(nei => {
//           if (!nei.neighbors.includes(block)) {
//             nei.neighbors.push(block);
//           } else if (!block.neighbors.includes(nei)) {
//             block.neighbors.push(nei);
//           }
//         });

//       });
//       this.blocks = newBlocks
//       return;
//     }

//     newBlocks = null;
//     startRandom = null;
//     startBlock = null;
//     _findnei = null;
//     this.blocks.forEach(block => { block.neighbors = []; block.visited = false });
//     this.config.divisionContent = 0;
//     this.randomMap();
//   }
//   // 是否有胜利者
//   isWin() {
//     const roles = this.roles.filter(_ => _.blocks.length > 0);
//     if (roles.length > 1) {
//       return null
//     } else {
//       return roles[0];
//     }
//   }

//   // 向外界更新数据
//   updataState() {
//     const newDate = {
//       currentRole: this.roles?.[this?.currentActionRole]?.getState(),
//       isStart: this.isStart,
//       winRole: this.winRole,
//       animation: this.animation,
//       roles: this.roles.map(_ => ({ name: _.name, color: _.color })),
//       aiInfo: this?.ai?.getAiInfo?.()
//     }
//     if (!isEqual(newDate, this.update)) {
//       this.update = newDate;
//       this.releaseData(newDate)
//     }
//   }
//   //渲染
//   renderCtx() {

//     setInterval(() => {
//       if (this.isStart && this.blocks.length) {
//         this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
//         this.blocks.forEach(_ => _.renderBlock(this.animation));
//         this.updataState();
//         this.winRole = this.isWin();
//         // if (this.winRole) {
//         //   return;
//         // }
//       }
//     }, 1000);

//     // requestAnimationFrame(this.renderCtx.bind(this));
//   }
//   // 下一步
//   nextStep() {
//     if (!this.isStart) {
//       return;
//     }
//     this.roles?.[this?.currentActionRole]?.nextStep();
//   }
//   // 下一个角色行动
//   nextRole(value) {
//     this.currentActionRole += 1;
//     if (this.currentActionRole >= this.roles.length) {
//       this.currentActionRole = 0;
//     }
//     if (this.roles[this.currentActionRole].blocks.length <= 0) {
//       return
//     }
//     this.roles[this.currentActionRole].attack();
//   }
//   // 更新ai数据
//   setAiInfo(info) {
//     this.animation = info.animation;
//     this.ai.setAiInfo(info)
//   }
//   // 开始游戏
//   startGame() {
//     this.isStart = true;
//     this.currentActionRole = 0;
//     this.roles?.[this?.currentActionRole]?.attack();
//   }
//   // 新游戏
//   newGame() {
//     this.init();
//     this.startGame();
//   }
// }