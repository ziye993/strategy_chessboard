import { IBlockPoint, IMapBlockData, TColorArray, TPoint, TRenderLinePoint, TVertexs } from "@/type/game.type";
import { getNewUUID, getDistance } from "../tool/utils";
import { drawHexagon, drawLine, getVertexs } from "@/tool/canvasUtils";
import { TAnyObject, TClassData, TId } from "@/type/globel.type";
import Role from "./role";
const gearContent: Record<number, number> = {
  1: 6,
  2: 6,
  3: 10,
  4: 10,
  5: 14,
  6: 6,
  7: 14,
};

function findNearestPoints(arr1: TVertexs, arr2: TVertexs) {
  let minDistance = Infinity;
  let index1 = -1;
  let index2 = -1;
  for (let i = 0; i < arr1.length; i++) {
    for (let j = 0; j < arr2.length; j++) {
      const distance = getDistance(arr1[i], arr2[j]);
      if (distance < minDistance) {
        minDistance = distance;
        index1 = i;
        index2 = j;
      }
    }
  }
  return [{ ...arr1[index1] }, { ...arr2[index2] }]
}

//游戏元素 //正六边形的块
export default class Block {
  content: number;
  color: TColorArray;
  id: TId | null;
  point: IBlockPoint;
  maxSize: number;
  neighbors: Block[];
  neighborsIds?: (number | string)[];
  positionX!: number;
  positionY!: number;
  isDisadvantaged?: boolean;
  belongsTo: Role | null;
  neighborsPositionIndex: number[];
  ctx: CanvasRenderingContext2D;
  selected: boolean;
  linghColor?: TColorArray;
  realIndex?: number;
  _isRefresh: boolean;
  _content?: number;
  i: number;
  fraction?: number;
  isAction?: boolean;
  contentIsMax?: boolean;
  relativeY!: number;
  relativeX!: number;
  available?: boolean;
  index!: number;
  actionType?: 'train' | '';
  constructor(ctx: CanvasRenderingContext2D, initData: any/**IMapBlockData*/) {
    this.realIndex = initData?.realIndex;
    this.content = initData._content || initData?.content || 0;
    this.color = [255, 255, 255, 0.3];
    this.id = initData.id || getNewUUID();
    this.point = { ...initData.point, ...getVertexs({ ...initData.point }) };
    this.maxSize = initData.maxSize || gearContent[Math.floor(Math.random() * 3) + 1];
    // size: this.point.size - (10 - this.maxSize) * (3 - this.maxSize / 5),
    this.belongsTo = (initData.belongsTo || null) as any;
    this.neighbors = (initData.neighbors || []) as any;
    this.neighborsPositionIndex = initData.neighborsPositionIndex || [];
    this.ctx = ctx;
    this.selected = false;
    this.isDisadvantaged = initData.isDisadvantaged || false;
    this._isRefresh = true;
    this.i = 0;
    this.index = initData.index;
    this.actionType = ''
    // this.game = game;
    // this.contentIsMax = false;
    // this.maxType = this.maxSize > 10 ? 2 : (this.maxSize > 6 ? 1 : 0);
  }


  get isRefresh() {
    return this._isRefresh
  }

  set isRefresh(value) {
    if (this._isRefresh === true) {
      if (this.actionType !== 'train') {
        console.log(11)
        this.renderBlock(this.i);
      }
      this._isRefresh = value;
      this.i++;
      if (this.i > 5) {
        this.i = 0
      }
    }
  }

  initNeighborsPositionIndex(currentblock: Block) {
    currentblock.neighbors.map(item => {
      // case循环
      switch (true) {
        case (item.point.x === currentblock.point.x && item.point.y < currentblock.point.y): return 0;
        case (item.point.x > currentblock.point.x && item.point.y < currentblock.point.y): return 1;
        case (item.point.x > currentblock.point.x && item.point.y > currentblock.point.y): return 2;
        case (item.point.x === currentblock.point.x && item.point.y > currentblock.point.y): return 3;
        case (item.point.x < currentblock.point.x && item.point.y > currentblock.point.y): return 4;
        case (item.point.x < currentblock.point.x && item.point.y < currentblock.point.y): return 5;
        default: return -1;
      }
    })
  }

  computerMeanValue(currentValue: TAnyObject, targetValue: TAnyObject, sliceNum: number) {

    if (sliceNum === 0) {
      return currentValue
    }
    const resValue = { ...currentValue };
    Object.keys(currentValue).forEach(_ => {
      if (typeof currentValue[_] === 'number' && typeof targetValue[_] === 'number') {
        resValue[_] = currentValue[_] + (targetValue[_] - currentValue[_]) / sliceNum;
        currentValue[_] = resValue[_];
      }
    });
    // console.log(resValue)
    return resValue;
  }


  renderBlock(i?: number) {
    if (this.neighbors.length === 0) return;
    if (!this.isRefresh) return

    let renderLinePoint: TRenderLinePoint = [];
    this.neighbors.forEach((nei, _neiIndex) => {
      const linePoints = findNearestPoints(this.point.vertexs, nei.point.vertexs);
      renderLinePoint.push([linePoints, this?.belongsTo?.color || this.color, nei?.belongsTo?.color || nei.color]);
    });
    requestAnimationFrame(() => {
      const clearPadding = Math.max(8, this.point.size * 0.5);
      this.ctx.clearRect(
        this.point.x - this.point.sideLength - clearPadding,
        this.point.y - this.point.size - clearPadding,
        this.point.sideLength * 2 + clearPadding * 2,
        this.point.size * 2 + clearPadding * 2
      );
      drawHexagon(
        this.ctx,
        this.point,
        this.belongsTo?.color || this.color,
        this.content,
        (this.content) / this.maxSize,
      );
      renderLinePoint.forEach(_ => {
        drawLine(this.ctx, _[0], _[1], _[2]);
      })
    })
  }

  isSelect(value: TPoint) {
    const px = getDistance(value, this.point);
    const selected = px < this.point.sideLength;
    return selected;
  }

  isNei(block: Block) {
    return this.neighbors.find(_ => _ === block)
  }

  hit(block?: Block | null) {
    if (!block) {
      return this
    }
    if (this?.belongsTo?.actionType === 1) { //加点阶段
      this.tryProliferation(1);
      return this
    }
    if (block?.belongsTo?.isAction && this?.belongsTo !== block?.belongsTo && this.isNei(block)) { //符合进攻特征
      if (block.belongsTo.actionType === 0) { //进攻阶段
        this.tryAttacked(block);
      }
    }
    return this
  }
  /**尝试被 block 攻击 */
  tryAttacked(block: Block, _mode?: string) {
    const neiSelect = block; //攻击者     this=被攻击者
    if (neiSelect && (neiSelect.belongsTo !== this.belongsTo)) {
      // 敌方进攻
      if (!neiSelect || !neiSelect.belongsTo || neiSelect.content === 1) {
        return '无法进攻'
      }
      requestAnimationFrame(() => {
        this.isRefresh = true;
        block.isRefresh = true;
      });
      block?.belongsTo?.wsaction?.(`attacked.${this.id}.${block.id}`)
      if (neiSelect.content - 2 >= this.content) { //可吃/覆盖/占领` 
        this.content = neiSelect.content - 1 - this.content;
        neiSelect.content = 1;
        this.belongsTo && (this.belongsTo.removeBlock(this));
        this.belongsTo = neiSelect.belongsTo;
        this.belongsTo.blocks.push(this);
        this.selected = true;
        return '可吃/覆盖/占领'
      } else if (neiSelect.content - 1 >= this.content) { //攻击者大1点 并且被攻击者处于虚弱状态
        this.content = 1;
        neiSelect.content = 1;
        if (this.isDisadvantaged && !neiSelect.isDisadvantaged) {
          this?.belongsTo?.removeBlock(this);
          this.belongsTo = neiSelect.belongsTo;
          this.isDisadvantaged = false;
          neiSelect.isDisadvantaged = false;
          return '被攻击者处于虚弱状态'
        } else {
          if (neiSelect.isDisadvantaged) {
            neiSelect.isDisadvantaged = true;
            return '攻击者处于虚弱状态'
          } else {
            neiSelect.isDisadvantaged = true;
            neiSelect.isDisadvantaged = true;
            return '攻击者大 [ 1 ] 点'
          }
        }
      } else if (this.content === neiSelect.content) {
        this.isDisadvantaged = true;
        neiSelect.isDisadvantaged = true
        this.content = 1;
        neiSelect.content = 1;
        return '两者相等'
      } else {
        neiSelect.isDisadvantaged = true;
        this.content = this.content - (neiSelect.content - 1);
        neiSelect.content = 1;
        neiSelect.content = 1;
        return '攻击者点数不足'
      }
    } else {
      return '无效攻击'
    }
  }

  tryProliferation(value: number = 1, _mode?: string) {
    if (!this.belongsTo) return

    if (this?.belongsTo?.fraction && (
      value <= 0
      || !this.belongsTo
      || isNaN(value)
      || this?.belongsTo?.fraction < 1
      || this.content === this.maxSize
    )) return false;
    this?.belongsTo?.wsaction?.(`proliferation.${this.id}`)
    this.isRefresh = true;
    const point = (this?.belongsTo && this?.belongsTo?.fraction < value) ? this.fraction : value;
    point && (this.content = this.content + point);
    point && (this.belongsTo.fraction -= point);
    return true
  }

}
