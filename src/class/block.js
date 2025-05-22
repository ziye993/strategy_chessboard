import { getNewUUID, getDistance } from "../tool/utils";
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

//游戏元素
export default class Block {
  constructor(ctx, game) {
    this.content = 0;
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
    this.game = game;
    this.contentIsMax = false;
    this.maxType = this.maxSize > 10 ? 2 : (this.maxSize > 6 ? 1 : 0);
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
      ...getVertexs({
        x: this.point.x,
        y: this.point.y,
        size: this.point.size - (10 - this.maxSize) * (3 - this.maxSize / 10),
      }),
      size: this.point.size - (10 - this.maxSize) * (3 - this.maxSize / 5),
      maxSize: this.maxSize,
    }
    this.color = config.color
  }

  renderBlock() {
    if (this.neighbors.length === 0) return;
    drawHexagon(
      this.ctx,
      this.point,
      (this.selected ? this.belongsTo?.linghColor : this.belongsTo?.color) || this.color,
      this.content,
      this.content / this.maxSize
    );
    this.neighbors.forEach(nei => {
      const linePoints = findNearestPoints(nei.point.vertexs, this.point.vertexs);
      if (this.belongsTo === nei.belongsTo && this.belongsTo) {
        drawLine(this.ctx, linePoints, this.belongsTo.linghColor);
      } else if (nei.belongsTo === null && this.belongsTo) {
        drawLine(this.ctx, linePoints, this.belongsTo.color);
      } else {
        drawLine(this.ctx, linePoints, [...this.color.toSpliced(2, 1), 0.5]);
        // drawLine(this.ctx, linePoints, [255, 0, 0, 1])
      }
    });
  }

  isSelect(value) {
    const px = getDistance(value, this.point);
    const selected = px < this.point.sideLength;
    selected && this.game.pushSelctBlockList(this)
    return selected;
  }

  tryNeigiveSelf(selectBlock, currentBlock) {
    if (selectBlock.belongsTo && (selectBlock.belongsTo !== currentBlock.belongsTo)) {//
      if (selectBlock.content !== 1) {
        this.content = selectBlock.content - 1;
        this.belongsTo = selectBlock.belongsTo;
        selectBlock.content = 1;
        selectBlock.selected = false;
        this.belongsTo.blocks.push(this);
        this.belongsTo.game.updataEmitter();
      }
    } else if (!selectBlock.belongsTo) {
      selectBlock.selected = false;
      this.selected = false;
    }
  }

  robotDivision(selectBlock) { //机器人分裂
    this.tryNeigiveSelf(selectBlock, this);
    this.renderBlock();
  }

  division(value) { //被选中//被点击//攻击
    //邻居是否被选中
    // this.belongsTo && this.belongsTo.selectEnd();
    const seled = this.isSelect(value);
    this.selected = seled;
    if (seled) { //选中
      const neiSelect = this.neighbors.find(item => { return item.selected });
      if (neiSelect) { // 邻居被选中
        this.tryNeigiveSelf(neiSelect, this);
      }
    }
    this.renderBlock();
  }

  selecteds(value) {
    this.selected = this.isSelect(value);
    this.renderBlock();
  }

  attacked(value) {
    const seled = this.isSelect(value);
    if (seled) { //选中
      console.log(1)
      const neiSelect = this.neighbors.find(item => { return item.selected && (item.belongsTo === this.game?.selectBlocks?.[0]?.belongsTo) });
      if (neiSelect && (neiSelect.belongsTo !== this.belongsTo)) {
        console.log(2)
        // 敌方进攻
        if (!neiSelect || !neiSelect.belongsTo) {
          return
        }
        if (neiSelect.content - 2 >= this.content) { //可吃/覆盖/占领
          console.log(3)
          this.content = neiSelect.content - 1 - this.content;
          neiSelect.content = 1;
          this.belongsTo = neiSelect.belongsTo;
          this.belongsTo.blocks.push(this);
          this.selected = true
          this.belongsTo.game.updataEmitter();
        } else if (this.content === neiSelect.content) { //抵消
          console.log(4)
          this.content = 1;
          neiSelect.content = 1;
          neiSelect.selected = true;
        } else if (neiSelect.content - 1 === this.content) {
          neiSelect.content = 1;
          this.content = 1;
          this.belongsTo = neiSelect.belongsTo;
        } else if (this.content > neiSelect.content) { //无法抵消
          console.log(5)
          this.content = this.content - (neiSelect.content - 1)
          neiSelect.content = 1;
        } else { //
          console.log(6)
        }
        console.log(7, this.content, neiSelect.content)
      } else {
        console.log(8, this.neighbors, this.game?.selectBlocks)
      }
    }
  }

  pointProliferation(value) {
    const seled = this.isSelect(value);
    if (seled) {
      if (this.belongsTo.fraction > 0) {
        if (this.content < this.maxSize) {
          this.content += 1;
          this.belongsTo.fraction -= 1;
        }
      }
      this.renderBlock();
      if (this.belongsTo.fraction === 0) { //结束
        this.game.nextSetp();
      }
    }
    this.selected = false;
    this.game.updateEvent()
  }

  proliferation(value) {
    let realValue = value;
    if (!isNaN(value) && value >= 0) {
      if (realValue > this.belongsTo.fraction) { //
        realValue = this.belongsTo.fraction;
      }
      this.content += realValue;
      if (this.content > this.maxSize) {
        this.belongsTo.fraction -= realValue - (this.content - this.maxSize);
        this.content = this.maxSize;
        this.contentIsMax = true;
      } else {
        this.belongsTo.fraction -= realValue;
      }
    } else {
      if (this.content < this.maxSize) { //
        this.content += 1;
        this.belongsTo.fraction -= 1;
        if (this.content === this.maxSize) { //
          this.contentIsMax = true;
        }
      }
    }

  }
}