
//画正六边形
export function drawHexagon(ctx, center, color, content = 0, fill = 0) {
  ctx.shadowOffsetX = -5;
  ctx.shadowOffsetY = -5;
  ctx.shadowBlur = 5;
  ctx.shadowColor = `rgba(${color.toSpliced(2, 1).join(',')},0.8)`;
  const { x, y, sideLength, size, vertexs, maxSize } = center;
  ctx.clearRect(x - size, y - size, size * 2, size * 2);
  // 图形
  ctxDrawHexagon(ctx, vertexs, color || '#FFF', false);
  // 填充内容
  if (fill) {
    const vert = getVertexs({ x, y, size: 20 + (size - 20) * fill });
    ctxDrawHexagon(ctx, vert.vertexs, color, true);
  }
  ctx.shadowBlur = 5;
  ctx.shadowOffsetX = -5;
  ctx.shadowOffsetY = -5;
  //文字
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center';
  ctx.lineWidth = 3;
  ctx.font = '22px Arial';
  ctx.fillStyle = '#FFF';
  content && ctx.fillText(content, center.x, center.y + 1);

  // ctx.fillText(`${center.relativeY}-${center.relativeX}`, center.x, center.y - 20)


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
export function drawLine(ctx, points, color) {
  if (!color) {
    throw new Error('color未找到', color);
  }
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;
  ctx.shadowColor = null;
  ctx.strokeStyle = `rgba(${color.join(',')})`;
  ctx.lineWidth = 1;
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
    { x: x - sideLength, y: y - size / 2 },
    { x: x, y: y - size },
    { x: x + sideLength, y: y - size / 2 },
    { x: x + sideLength, y: y + size / 2 },
    { x: x, y: y + size },
    { x: x - sideLength, y: y + size / 2 },
  ];
  return { vertexs, sideLength }
}



//计算中心点
function getCenters(ctx, size = 30) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const sideLength = getSideLingth(size);
  const initialCenter = { x: sideLength, y: size };
  const center = { ...initialCenter, sideLength, size };
  const centers = [[{ ...center }]];
  let offsetx = 0;
  let offsety = 0;
  while (center.x < width - sideLength && center.y < height - size) {

    center.x += 2 * sideLength;
    // center.y = center.y + size * 1.5 * (centers.length - 1);
    if (center.x + offsetx >= (width - sideLength)) {
      center.x = sideLength;
      if (centers.length % 2 === 1) {
        center.x = 2 * sideLength;
      }
      center.y = center.y + size * 1.5;
      if (center.y + offsety >= height - size) {
        break
      }
      centers.push([{ ...center, sideLength, size }]);
    } else {
      centers[centers.length - 1].push({ ...center, sideLength, size });
    }
  }
  offsetx = (width - (centers[0][centers[0].length - 1].x + sideLength)) / 2;
  offsety = (height - (centers[centers.length - 1][centers[centers.length - 1].length - 1].y + sideLength)) / 2;
  return centers.map(_ => _.map(__ => { __.x += offsetx; __.y += offsety; return __ }));
}

export function renderHexagon(ctx, size = 30) {
  const centers = getCenters(ctx, size);
  const centerList = [];
  let length = 0;
  // const centerPoint = []
  centers.forEach((row, ri) => {
    // const newrow = []
    row.forEach((center, li) => {
      // drawHexagon(ctx, center);
      const x = center.x, y = center.y, sideLength = center.sideLength;
      length++;
      // const { vertexs, sideLength } = getVertexs({ x, y, size })
      centerList.push({ ...center, sideLength, relativeX: li, relativeY: ri });

    });
  });
  return { centers: centerList, length };
}