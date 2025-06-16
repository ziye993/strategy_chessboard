
//画正六边形
export function drawHexagon(ctx, center, color, content = 0, fill = 0, changeTip, tipTop) {
  ctx.shadowOffsetX = -5;
  ctx.shadowOffsetY = -5;
  // ctx.shadowBlur = 5;
  // ctx.shadowColor = `rgba(${color.toSpliced(2, 1).join(',')},1)`;
  const { x, y, sideLength, size, vertexs, maxSize } = center;
  // ctx.clearRect(x - size, y - size, size * 2, size * 2);
  // 图形
  ctxDrawHexagon(ctx, vertexs, color || '#FFF', false);
  // 填充内容
  if (fill) {
    const vert = getVertexs({ x, y, size: 10 + (size - 10) * fill });
    ctxDrawHexagon(ctx, vert.vertexs, color, true);
  }
  ctx.shadowBlur = 30;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  //文字
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center';
  ctx.lineWidth = 3;
  ctx.font = '22px Arial';
  ctx.fillStyle = '#FFF';
  content && ctx.fillText(content, center.x, center.y + 1);
  changeTip && ctx.fillText(changeTip, center.x, tipTop)
  // ctx.fillText(`${center.relativeY}-${center.relativeX}`, center.x, center.y - 20)
}

/**
* 清除由六个点定义的六边形区域
* @param {CanvasRenderingContext2D} ctx Canvas上下文
* @param {Array} points 包含六个点的数组，每个点为 {x, y} 对象
*/
export function clearHexagonByPoints(ctx, points) {
  if (points.length !== 6) {
    throw new Error('必须提供六个点来定义六边形');
  }

  // 保存当前上下文状态
  ctx.save();

  // 设置合成模式为 "destination-out"（清除目标区域）
  ctx.globalCompositeOperation = 'destination-out';

  // 开始绘制六边形路径
  ctx.beginPath();

  // 移动到第一个点
  ctx.moveTo(points[0].x, points[0].y);

  // 连接其余五个点
  for (let i = 1; i < 6; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  // 闭合路径
  ctx.closePath();

  // 填充路径（清除该区域的内容）
  ctx.fill();

  // 恢复上下文状态
  ctx.restore();
}

/**
 * 在Canvas上绘制小准星
 * @param {CanvasRenderingContext2D} ctx Canvas上下文
 * @param {number} x 准星中心点X坐标
 * @param {number} y 准星中心点Y坐标
 * @param {string} [color='black'] 准星颜色
 */
export function drawCrosshair(ctx, x, y, color = 'red') {
  // 保存当前上下文状态
  ctx.save();

  // 设置绘制样式
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.5;
  ctx.lineCap = 'round'; // 使线条末端平滑

  // 绘制准星
  ctx.beginPath();

  // 绘制横线（左半部分）
  ctx.moveTo(x - 5, y);
  ctx.lineTo(x, y);

  // 绘制横线（右半部分）
  ctx.moveTo(x, y);
  ctx.lineTo(x + 5, y);

  // 绘制竖线（上半部分）
  ctx.moveTo(x, y - 5);
  ctx.lineTo(x, y);

  // 绘制竖线（下半部分）
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 5);

  // 绘制中心点（可选）
  ctx.moveTo(x, y);
  ctx.arc(x, y, 0.25, 0, Math.PI * 2);

  // 描边
  ctx.stroke();

  // 恢复上下文状态
  ctx.restore();
}

function ctxDrawHexagon(ctx, vert, color, fill) {
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = `rgba(${color.join(',')})` || '#FFF';
  ctx.fillStyle = `rgba(${color.join(',')})` || '#FFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(vert[0].x, vert[0].y);//1
  ctx.lineTo(vert[1].x, vert[1].y);//2
  ctx.lineTo(vert[2].x, vert[2].y);//3
  ctx.lineTo(vert[3].x, vert[3].y);//4
  ctx.lineTo(vert[4].x, vert[4].y);//5
  ctx.lineTo(vert[5].x, vert[5].y);//6
  ctx.lineTo(vert[0].x, vert[0].y);//1 起点
  ctx.closePath();
  fill && ctx.fill();
  ctx.stroke();
}

//线条
export function drawLine(ctx, points, startColor, endColor, lineWidth = 0.4) {
  // 验证参数
  if (!startColor && !endColor) {
    throw new Error('必须提供起始颜色和结束颜色');
  }
  if (points.length !== 2) {
    throw new Error('线条必须包含两个点（起点和终点）');
  }
  let _startColor = startColor || endColor, _endcolor = endColor || startColor;

  // 重置阴影效果
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;
  ctx.shadowColor = null;

  // 创建线性渐变对象
  const gradient = ctx.createLinearGradient(
    points[0].x, points[0].y,  // 渐变起点
    points[1].x, points[1].y   // 渐变终点
  );

  // 添加颜色停止点（0%为起始颜色，100%为结束颜色）
  gradient.addColorStop(0, `rgba(${_startColor.join(',')})`);
  gradient.addColorStop(1, `rgba(${_endcolor.join(',')})`);

  // 设置线条样式
  ctx.strokeStyle = gradient;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';  // 线条端点样式（圆形）
  ctx.lineJoin = 'round'; // 线条拐角样式（圆形）

  // 绘制线条
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  ctx.lineTo(points[1].x, points[1].y);
  ctx.closePath();
  ctx.stroke();
}

// 已知斜边时，求长直角边的长度
function getSideLingth(size) {
  const hypotenuse = size;
  // 先求出短直角边
  const shortSide = hypotenuse / 2;
  // 根据勾股定理求长直角边
  const longSide = Math.sqrt(hypotenuse * hypotenuse - shortSide * shortSide);
  return longSide;
}

export function getVertexs({ x, y, size }) {
  const sideLength = getSideLingth(size);
  const vertexs = [
    { x: x, y: y - size },
    { x: x + sideLength, y: y - size / 2 },
    { x: x + sideLength, y: y + size / 2 },
    { x: x, y: y + size },
    { x: x - sideLength, y: y + size / 2 },
    { x: x - sideLength, y: y - size / 2 },
  ];
  return { vertexs, sideLength }
}

//计算中心点
export function getHexagonCenters(wl, hl, size) {
  const sideLength = getSideLingth(size);
  const centers = [];
  let padding = 100;
  let maxWidth, maxHeight
  for (let h = 1; h < hl * 3 + 1; h++) {
    for (let w = 1; w < wl + 1; w++) {
      if (h % 2 === 0) { //偶数行
        centers.push({
          sideLength,
          size,
          x: (1 + ((w - 1) * 6)) * sideLength + padding,
          y: 2.5 * size + (h / 2 - 1) * 3 * size + padding, //
          relativeX: w,
          relativeY: h / 2,
        });
        maxHeight = size + ((h - 1) / 2) * 3 * size + padding + (padding + size);
      } else { //奇数行
        centers.push({
          sideLength,
          size,
          x: (4 + ((w - 1) * 6)) * sideLength + padding,
          y: size + ((h - 1) / 2) * 3 * size + padding,
          relativeX: w,
          relativeY: (h - 1) / 2,
        });
        maxWidth = (4 + ((w - 1) * 6)) * sideLength + padding + (padding + size);

      }
    }
  }
  return { centers, maxWidth, maxHeight }
}
