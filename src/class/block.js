import { getNewUUID, getDistance, isEqual } from "../tool/utils";
import { drawHexagon, drawLine, getVertexs } from "../tool/canvasUtils";

const gearContent = {
  1: 6,
  2: 6,
  3: 10,
  4: 10,
  5: 14,
  6: 6,
  7: 14,
}

function findNearestPoints(arr1, arr2) {
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
  constructor(ctx, _key) {
    this._key = _key;
    this._content = 0;
    this.color = [34, 34, 34, 1];
    this.id = null;
    this.point = { x: 0, y: 0 };
    this.maxSize = 0;
    this.belongsTo = null;
    this.neighbors = [];
    this.neighborsPositionIndex = [];
    this.vertex = [];
    this.ctx = ctx;
    this.selected = false;
    this.isDisadvantaged = false;

    this.currentRenderStatus = {
      content: 0,
      remainingFrames: 0,
      tipTop: this.point.y,
      changeTip: '',
    }
    this.targetRenderStatus = {
      content: this._content,
      remainingFrames: 120,
      tipTop: this.point.y - 50,
      changeTip: ''
    }
    // this.game = game;
    // this.contentIsMax = false;
    // this.maxType = this.maxSize > 10 ? 2 : (this.maxSize > 6 ? 1 : 0);
  }

  get key() {
    return this._key
  }

  get content() {
    return this._content;
  }

  set content(value) {
    this.targetRenderStatus.content = value;
    this.currentRenderStatus.remainingFrames = 0;
    this.currentRenderStatus.changeTip = (this._content - value) + '' || null;
    this.currentRenderStatus.tipTop = this.point.y;
    this.targetRenderStatus.tipTop = this.point.y - 50;
    this._content = value;
  }

  initNeighborsPositionIndex() {
    this.neighborsPositionIndex = this.neighbors.map(item => {
      // case循环
      switch (true) {
        case (item.point.x === this.point.x && item.point.y < this.point.y): return 0;
        case (item.point.x > this.point.x && item.point.y < this.point.y): return 1;
        case (item.point.x > this.point.x && item.point.y > this.point.y): return 2;
        case (item.point.x === this.point.x && item.point.y > this.point.y): return 3;
        case (item.point.x < this.point.x && item.point.y > this.point.y): return 4;
        case (item.point.x < this.point.x && item.point.y < this.point.y): return 5;
        default: return -1;
      }
    })
  }

  init(point, config) { //初始化
    this.point = point;
    this.id = getNewUUID();
    //6-18之间的随机数
    this.maxSize = gearContent[Math.floor(Math.random() * 3) + 1];
    // 计算顶点坐标
    this.point = {
      ...this.point,
      ...getVertexs({ //顶点位置
        x: this.point.x,
        y: this.point.y,
        size: this.point.size - (10 - this.maxSize) * (3 - this.maxSize / 10),
      }),
      size: this.point.size - (10 - this.maxSize) * (3 - this.maxSize / 5),
      maxSize: this.maxSize,
    }
    this.color = config.color;
  }

  computerMeanValue(currentValue, targetValue, sliceNum) {

    if (sliceNum === 0) {
      return currentValue
    }
    const resValue = { ...currentValue };
    Object.keys(currentValue).forEach(_ => {
      if (typeof currentValue[_] === 'number' && typeof targetValue[_] === 'number') {
        resValue[_] = currentValue[_] + (targetValue[_] - currentValue[_]) / sliceNum;
        currentValue[_] = resValue[_];
        console.log(currentValue[_])
      }
    });
    // console.log(resValue)
    return resValue;
  }

  renderBlock(animation) {
    if (this.neighbors.length === 0) return;
    if (animation) {
      this.currentRenderStatus = this.targetRenderStatus;
    }
    drawHexagon(
      this.ctx,
      this.point,
      (this.selected ? this.belongsTo?.linghColor : this.belongsTo?.color) || this.color,
      this.content, //this.content,
      (this._content) / this.maxSize,
      // this.currentRenderStatus.changeTip,
      // this.currentRenderStatus.tipTop
    );
    this.neighbors.forEach(nei => {
      const linePoints = findNearestPoints(nei.point.vertexs, this.point.vertexs);
      let lineColor = [...this.color.toSpliced(2, 1), 0.5];
      if (this.belongsTo === nei.belongsTo && this.belongsTo) {
        lineColor = this.belongsTo.linghColor;
      } else if (nei.belongsTo === null && this.belongsTo) {
        lineColor = this.belongsTo.color;
      }
      drawLine(this.ctx, linePoints, lineColor);
    });
    if (this.currentRenderStatus.remainingFrames === this.targetRenderStatus.remainingFrames) {
      this.currentRenderStatus.changeTip = ""
      return
    } else {
      // this.currentRenderStatus = this.computerMeanValue(this.currentRenderStatus, this.targetRenderStatus, this.targetRenderStatus.remainingFrames - this.currentRenderStatus.remainingFrames);
      // this.currentRenderStatus.remainingFrames++;
      // console.log(this.currentRenderStatus)
    }
  }

  isSelect(value) {
    const px = getDistance(value, this.point);
    const selected = px < this.point.sideLength;
    return selected;
  }

  isNei(block) {
    return this.neighbors.find(_ => _ === block)
  }

  hit(block) {
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


  tryAttacked(block) {
    const neiSelect = block; //攻击者     this=被攻击者
    if (neiSelect && (neiSelect.belongsTo !== this.belongsTo)) {
      // 敌方进攻
      if (!neiSelect || !neiSelect.belongsTo || neiSelect.content === 1) {
        return '无法进攻'
      }
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
          this.belongsTo.removeBlock(this);
          this.belongsTo = neiSelect.belongsTo;
          this.isDisadvantaged = false;
          this.neighbors.isDisadvantaged = false;
          return '被攻击者处于虚弱状态'
        } else {
          if (neiSelect.isDisadvantaged) {
            this.neighbors.isDisadvantaged = false;
            return '攻击者处于虚弱状态'
          } else {
            this.neighbors.isDisadvantaged = true;
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

  tryProliferation(value) {
    if (
      value <= 0
      || !this.belongsTo
      || isNaN(value)
      || this.belongsTo.fraction < 1
      || this.content === this.maxSize
    ) return false;
    const point = this.belongsTo.fraction < value ? this.fraction : value;
    this.content += point;
    this.belongsTo.fraction -= point;
    return true
  }
}