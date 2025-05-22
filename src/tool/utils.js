export function isTrue(str) {
  return str === 'true' || str === true;
}
const { v4: uuidv4 } = require('uuid');

export function getUUID() {
  var d = new Date().getTime();
  var uuid = 'xx-xx-tx-ix'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(8);
  });
  return uuid;
};

export function getNewUUID(solceNumber = 8) {
  return uuidv4().slice(0, solceNumber);
}

//计算两点之间的距离
export function getDistance(point1, point2) {
  return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
}
let randomIndex = 0;
export function getNsRandom(n, min = 0, max = 0, noRepeat = true) {
  if (min < 0 || max < 0) {
    throw Error(`无法生成随机数::min:${min},max:${max}`)
  }
  if (isNaN(min) || isNaN(max) || isNaN(n)) {
    throw Error('参数错误')
  }
  if (min > max) {
    [min, max] = [max, min];
  }
  if (max - min < n) {
    throw Error('范围不够')
  }
  if (n <= 0) {
    return [];
  }
  const arr = new Array(Math.floor(max - min)).fill(0).map((v, i) => i);
  const resArr = [];
  while (resArr.length < n) {
    resArr.push(arr.splice(Math.floor(Math.random() * arr.length), 1)[0]);
  }
  return resArr;
}

export function logObjs(...arg) {
  const arr = [];
  arg.forEach(item => {
    if (typeof item === 'object') {
      let objStr = ["\nobj:{\n"];
      for (const key in item) {
        if (Object.prototype.hasOwnProperty.call(item, key)) {
          const els = item[key];
          if (typeof els !== 'object') {
            objStr.push(`${key}:${els}\n`);
          }
        }
      }
      objStr = objStr.join('') + '}';
      arr.push(objStr);
    } else {
      arr.push(item);
    }
  });
}

export function getLimitRandom(min, max, integer) {
  if (min < 0 || max < 0) {
    throw Error(`无法生成随机数::min:${min},max:${max}`)
  }
  if (isNaN(min) || isNaN(max)) {
    throw Error('参数错误')
  }
  if (min > max) {
    [min, max] = [max, min];
  }
  let ranNum = Math.random() * (max - min) + min;
  if (integer) {
    ranNum = Math.floor(ranNum);
  }
  return ranNum;
}

export function createNDArray(...dims) {
  const initialValue = dims.pop();
  return dims.reduceRight((acc, dim) =>
    Array(dim).fill().map(() => structuredClone(acc)), initialValue
  );
}

export function visitNDArray(...dims) {
  const [arr, curr, ...dimsOther] = dims;
  if (Array.isArray(arr) === false) {
    throw Error('参数错误')
  } else if (dims.length === 1) {
    return arr;
  } else if (arr.length === 0) {
    throw Error('请传入参数')
  }
  const currArr = arr[curr];
  if (dimsOther.length === 0) {
    return currArr;
  }
  if (Array.isArray(currArr)) {
    return visitNDArray(currArr, ...dimsOther);
  } else {
    if (dimsOther.length !== 0) {
      throw Error('')
    } else return currArr;
  }

}

export function setNDArray(...dims) {
  const [arr, value, curr, ...dimsOther] = dims;
  if (Array.isArray(arr) === false) {
    throw Error('参数错误')
  } else if (dims.length === 1) {
    arr[curr] = value;
    return arr;
  } else if (arr.length === 0) {
    throw Error('数组长度为0,请检查数组！')
  }
  arr[curr] = setNDArray(arr[curr], value, ...dimsOther);
}

