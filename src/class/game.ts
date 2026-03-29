

import { TClassData, TId } from "@/type/globel.type";
import Block from "./block";
import Role from "./role";
import { TCenters } from "@/type/utils.type";
import { IAiInfo, IBlocksMap, IGameConfig, IInitGameConfig, IMapBlockData, IMapData, IUpdate, TBlockMap, TConnectingSectionsCenters, TGameType, TInitData, TMapRoleData, TNeiConnectingSectionsCenter, TNeiConnectingSectionsCenters } from "@/type/game.type";
import { getDistance, getLimitRandom, getNsRandom, getUUID, isEqual } from "@/tool/utils";
import { getHexagonCenters, getVertexs } from "@/tool/canvasUtils";
import AiAgent from "@/QLearning";
import { IGameConfig as IMainGameConfig } from "@/type/main.type";
import { IMessageData } from "@/type/hooks.type";
import { TErrorType } from "@/type/error.type";
const gameConfig: IGameConfig = {
  branchProbability: 0.9,// 产生分支概率
  branchAttenuation: 0.991, //产生分支衰减
  blockSize: 60, // 块大小，
  effectiveBlockAtt: 0.5,
  notNullBlockProb: 0.70, //初始不空概率·
  colors: {
    '清新简约风': [[4, 112, 0, 1], [0, 104, 136, 1], [187, 184, 0, 1]],
    '科技未来风': [[75, 0, 130, 1], [100, 149, 237, 1], [186, 85, 211, 1]],
  }

}
// rgb(187, 184, 0)
const gearContent: Record<number, number> = {
  1: 6,
  2: 6,
  3: 10,
  4: 10,
  5: 14,
  6: 6,
  7: 14,
}


function initNeighborsPositionIndex(block: TNeiConnectingSectionsCenter) {
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


const entertainOneself = true; // 自娱自乐模式,自己和自己下棋
//游戏主逻辑
export default class Game {
  ctx: CanvasRenderingContext2D;
  blocks: Block[];

  releaseData: null | ((param: IUpdate) => void);
  hitBlock: Block | null;
  update: IUpdate | null;
  animation: boolean;
  _winRole: Role | null;
  ai: AiAgent;
  eventClick: (param: { clientX: number; clientY: number; }) => void;
  mapSize?: number;
  gameType?: TGameType;
  aiBlocks: Block[];
  currentActionRole: number;
  locaPlayerId?: TId;
  roles: Role[];
  canvasPadding?: number;
  mapHeight?: number;
  mapWidth?: number;
  id: TId;
  isStart?: boolean;
  initData?: IMainGameConfig;
  stepCount: number;
  constructor(ctx: CanvasRenderingContext2D, initData?: IMainGameConfig, id?: TId) {
    this.ctx = ctx; //画布
    this.initData = initData;
    this.releaseData = null;
    this.winRole = null;
    this.hitBlock = null;
    this.update = null;
    this.animation = false;
    this._winRole = null;
    this.ai = new AiAgent(this);
    this.eventClick = this.handleClick.bind(this);
    this.mapSize = initData?.mapSize;
    this.gameType = initData?.gametype;
    this.aiBlocks = [];
    this.blocks = [];
    this.currentActionRole = 0;
    this.locaPlayerId = id;
    this.roles = [];
    this.id = getUUID();
    this.init(initData);
    this.needHandleClickEvent()
    this.stepCount = 0;
    // this.updateEvent = (callback: (data: IUpdate | null) => void) => { callback(this.update) };
  }
  canvasInit(mapWidth: number, mapHeight: number) {
    this.ctx.canvas.width = mapWidth;
    this.ctx.canvas.height = mapHeight;
  }

  blockInit(centers: TCenters) {
    const defaultBlock = {
      neighbors: [],
      neighborsPositionIndex: [],
    };
    this.blocks = this.connectingSections(centers.map((center, _key) => ({ ...defaultBlock, realIndex: _key, point: { ...center } })))
      .map((_, _index) => {
        const maxSize = gearContent[Math.floor(Math.random() * 3) + 1];
        const pointSize = gameConfig.blockSize - (10 - maxSize) * (3 - maxSize / 5)
        return new Block(this.ctx, {
          ..._,
          index: _index,
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
    const blocksMap: IBlocksMap = this.blocks.reduce((currentvalue, _) => ({ ...currentvalue, [_.realIndex + '']: _ }), {});
    this.blocks.forEach((_, _index) => {
      _.neighbors = _.neighbors.map(__ => blocksMap[__.realIndex + '']);
    });
  }

  initMapToData(_blocks: IMapBlockData[], roles: TMapRoleData[]) {
    const blocks = _blocks.map((_) => {
      return new Block(this.ctx, { ..._ });
    })
    const blocksMap: IBlocksMap = blocks.reduce((currentvalue, _) => ({ ...currentvalue, [_.id + '']: _ }), {});
    this.blocks = blocks.map((_, _index) => {
      _.neighbors = _.neighbors.map(__ => blocksMap[__ + '']);
      _.realIndex = _index;
      return _
    });
    const self = this;
    this.roles = roles.map(_ => {
      const role = new Role({
        ..._,
        blocks: _.blocks.map(__ => blocksMap[__ + '']),
        nextRole: this.nextRole.bind(self),
        localPlayer: this.locaPlayerId === _.id,
        name: _.name || _.id
      });
      role.blocks.forEach(_block => _block.belongsTo = role);

      return role
    });

    if (this.gameType === 'local') {
      this.roles[0].id = this.locaPlayerId || Math.random();
    }
  }

  initMapToRandom(row: number, lin: number) {
    this.id = getUUID();
    const { centers, maxWidth: mapWidth, maxHeight: mapHeight, padding: canvasPadding } = getHexagonCenters(row, lin, gameConfig.blockSize);
    if (!mapWidth || !mapHeight) throw Error("not mapWidth or not mapHeight")
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
    const n = Math.floor(Math.random() * 3); // 0,1,2
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
    this.locaPlayerId = this.roles[n].id
  }

  saveMap(other = {}) {
    const id = this.id;
    const mapData: IMapData = {
      canvasPadding: this.canvasPadding,
      mapHeight: this.mapHeight,
      mapWidth: this.mapWidth,
      mapSize: this.mapSize,
      ...other,
      blocks: this?.blocks?.map(_ => ({
        realIndex: _.realIndex,
        id: _.id,
        _content: _._content,
        content: _.content,
        point: _.point,
        maxSize: _.maxSize,
        belongsTo: _?.belongsTo?.id,
        neighbors: _.neighbors.map(_nei => _nei.id),
        neighborsPositionIndex: _.neighborsPositionIndex,
        isDisadvantaged: _.isDisadvantaged,
      })),
      roles: (this.roles || []).map(_ => ({
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
        localPlayer: _.localPlayer,
      })),
      id,
    }
    try {
      const mapList = JSON.parse(localStorage.getItem("mapList") ?? "") || [];
      mapList.push(id);
      localStorage.setItem('mapList', JSON.stringify(mapList));
      localStorage.setItem(id + '', JSON.stringify(mapData));
    } catch (error) {

    }
  }

  deleteMap(id: TId) {
    try {
      let mapList = JSON.parse(localStorage.getItem("mapList") ?? "") || [];
      mapList = mapList.filter((_: string) => _ !== id);
      localStorage.setItem('mapList', JSON.stringify(mapList));
      localStorage.removeItem(id + '');
    } catch (error) {

    }
  }

  loadMap() {
    try {
      const mapData: IMapData = JSON.parse(localStorage.getItem("mapList") ?? "");
      this.initMapToData(mapData?.blocks, mapData.roles);
    } catch (error) {

    }
  }

  init(initData?: IInitGameConfig) {
    const { blocks, roles, canvasPadding = 100, mapHeight, mapWidth, mapSize } = initData || {};
    if (blocks && roles && canvasPadding && mapHeight && mapWidth) {
      this.initMapToData(blocks, roles);
      this.canvasInit(mapWidth, mapHeight);
    } else {
      mapSize && this.initMapToRandom(mapSize, mapSize);
    }
    this.winRole = null;
    this.blocks.forEach(_ => { _.renderBlock() })
    this.startGame();
    this.renderCtx();
    return true
  }

  // 绑定点击事件
  handleClick(event: { clientX: number; clientY: number; }) {
    const rect = this.ctx.canvas.getBoundingClientRect();
    const clickInfo = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
    this.hitBlock = this.blocks.find(_ => _.isSelect(clickInfo))?.hit(this.hitBlock) || this.hitBlock;
  }

  // 查找邻居/随机地图
  connectingSections(_centers: TConnectingSectionsCenters) {

    const centers: TNeiConnectingSectionsCenters = _centers.map(_ => ({ ..._, allNei: Array<TNeiConnectingSectionsCenter>() }));
    let originBlock = [...centers];
    let startRandom = getLimitRandom(0, originBlock.length, true);
    let startBlock = originBlock[startRandom];
    while (originBlock.length / centers.length < gameConfig.notNullBlockProb) {
      originBlock = centers.filter(_ => Math.random() < gameConfig.notNullBlockProb);
    }
    for (let i = 0; i < originBlock.length; i++) {
      for (let j = 0; j < originBlock.length; j++) {
        const { x, y } = originBlock?.[i]?.point || {};
        const { x: eachx, y: eachy } = originBlock[j]?.point || {};
        if (!x || !y || !eachx || !eachy) throw Error("not x or y")
        const dt = getDistance({ x, y }, { x: eachx, y: eachy });
        if (dt < (gameConfig.blockSize * 3.1) && originBlock[i].realIndex !== originBlock[j].realIndex) {
          originBlock[i]?.allNei?.push?.(originBlock[j])
        }
      }
    }

    // 查找邻居
    function _findnei(currentBlock: TNeiConnectingSectionsCenter, ba: number) {
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
    const newDate: Omit<IUpdate, 'error'> = {
      currentRole: this.roles?.[this?.currentActionRole]?.getState(),
      gameType: this.gameType,
      isStart: this.isStart,
      winRole: this.winRole,
      animation: this.animation,
      roles: this?.roles?.map(_ => ({ name: _.name, color: _.color })),
      aiInfo: this?.ai?.getAiInfo?.()
    }
    // this?.releaseData?.(newDate)
    // console.log(isEqual(newDate, this.update))
    // 
    if (!isEqual(newDate, this?.update) && this?.releaseData) {
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
    if (this.gameType === 'local' && entertainOneself) {
      this.roles?.[this?.currentActionRole]?.nextStep();
      this.needHandleClickEvent();
    } else if (this.roles[this.currentActionRole].id === this.locaPlayerId) {
      this.roles?.[this?.currentActionRole]?.nextStep();
      this.needHandleClickEvent();
    }
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
  setAiInfo(info: IAiInfo & { animation?: boolean }) {
    this.animation = info.animation ?? this.animation;
    this.ai.setAiInfo(info)
  }

  needHandleClickEvent() {
    this.ctx.canvas.removeEventListener('click', this.eventClick);
    if (this.gameType === 'local' && entertainOneself) {
      this.ctx.canvas.addEventListener('click', this.eventClick);
    } else if (this?.roles?.[this.currentActionRole]?.id === this?.locaPlayerId) {
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
  newGame(type?: 'train') {
    if (this.gameType === 'line') {
      return
    }
    this.init(this.initData);
    this.needHandleClickEvent();
    if (type === "train") {
      this.blocks.forEach(_ => _.actionType = "train")
    }
  }

  playerAction(actionStr = ""): IMessageData {
    const actionInfoList = actionStr.split('.');
    if (actionInfoList[2] === 'disconnect') {
      console.log(`用户: ${actionInfoList[1]} 以离开 0秒`);
      return {
        error: TErrorType.PLAYER_OUT,
        message: `用户: ${actionInfoList[1]} 已离开 ${Math.floor((Date.now() - Number(actionInfoList[0])) / 1000)} 秒`,
        time: Date.now(),
      }
    }
    const actionPlayerId = actionInfoList[1];
    const role = this.roles[this.currentActionRole];
    if ((role.id + '') !== (actionPlayerId + '')) {
      console.log('错误数据： ', actionStr)
      return {
        error: TErrorType.GAME_DATA_EXCEP,
        message: `对局数据异常`,
        time: Date.now(),
      }
    }
    const type = actionInfoList?.[2];
    const actionInfo = actionInfoList.splice(2);
    const blocksMap = this.blocks.reduce((currvalue, _) => ({ ...currvalue, [_.id + '']: _ }), {} as TBlockMap);
    switch (type) {
      case 'proliferation':
        blocksMap?.[actionInfo?.[1]]?.tryProliferation(1);
        break
      case 'attacked':
        blocksMap[actionInfo[1]].tryAttacked(blocksMap[actionInfo[2]]);
        break;
      case 'nextstep':
        this.roles?.[this?.currentActionRole]?.nextStep();
        this.needHandleClickEvent();
        break;
      default:
        break;
    }
    return {
      error: TErrorType.SUCCESS,
      message: ``,
      time: Date.now(),
    }
  }

  getHoverBlock(x: number, y: number) {
    const current = this.blocks.find(_ => _.isSelect({ x, y }))
    return current
  }

  renderAllBlock() {
    this.blocks.forEach(_ => _.renderBlock())
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


