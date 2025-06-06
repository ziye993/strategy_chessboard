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


export function isEqual(objA, objB) {
  // 首先检查是否为同一个引用
  if (Object.is(objA, objB)) return true;

  // 检查是否有一个不是对象
  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false;
  }

  // 获取所有自身属性（包括不可枚举属性，但不包括 Symbol 类型的属性）
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  // 检查属性数量是否相同
  if (keysA.length !== keysB.length) return false;

  // 递归检查每个属性的值是否相同
  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (
      !Object.prototype.hasOwnProperty.call(objB, key) ||
      !isEqual(objA[key], objB[key])
    ) {
      return false;
    }
  }

  return true;
}


export function saveQTable(filename, qTable) {
  localStorage.setItem(filename, JSON.stringify(qTable));
}

export function deepMerge(target, source) {
  const isObject = (obj) => obj && typeof obj === 'object';

  // 对源对象进行深拷贝
  const targetCopy = JSON.parse(JSON.stringify(target));
  const sourceCopy = JSON.parse(JSON.stringify(source));

  if (!isObject(targetCopy) || !isObject(sourceCopy)) {
    return sourceCopy;
  }

  Object.keys(sourceCopy).forEach(key => {
    const targetValue = targetCopy[key];
    const sourceValue = sourceCopy[key];

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      targetCopy[key] = targetValue.concat(sourceValue);
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      targetCopy[key] = deepMerge(targetValue, sourceValue);
    } else {
      targetCopy[key] = sourceValue;
    }
  });

  return targetCopy;
}


let logHistory = [];
let isLog = false;
// let timeId = 10;
let currentTime = 0;
export function customLog(message) {
  if (isLog) {
    return
  }
  if (currentTime === 0) {
    currentTime = Date.now();
    return;
  }
  const c = Date.now();
  if (c - currentTime > 2000) {
    console.clear();
    console.table(logHistory);
    isLog = true;
    logHistory = [];
    currentTime = c
  } else {
    logHistory.push(message);
  }
}

export function multiply(a, b) { //除法
  const scale = Math.pow(10, Math.max(
    (a.toString().split('.')[1] || '').length,
    (b.toString().split('.')[1] || '').length
  ));
  return (a * scale) * (b * scale) / (scale * scale);
}

const promiseTimeOut = 2000;

export function workerPromise(worker, type, timeOut, ...data) {

  return new Promise((res, rej) => {
    const id = Math.random();
    worker.onmessage = e => {
      if (('' + e.data.id) === ('' + id)) {
        worker.onmessage = undefined;
        res(e.data.data);
        worker.onmessage = undefined
      }
      else {
        console.warn(`id 错误: e.id:${e.data.id}, random.id:${id}`);
        console.log(e)
      };

    };
    worker.postMessage({ type: type, data: [...data], id });
    timeOut !== Infinity && setTimeout(() => rej("超时" + type,), timeOut || promiseTimeOut);
  });
}

export function workerfun(worker, type, ...data) {
  worker.postMessage({ type: type, data: [...data] })
}

export function aiLog(...param) {
  console.log(...param.map(_ => typeof _ === 'string' ? `[[ ${_} ]]` : _));
}

export function padNumber(input, targetLength) {
  const str = String(input);
  const lengthDiff = targetLength - str.length;

  if (lengthDiff <= 0) {
    return str; // 长度足够或超出，直接返回
  }

  // 处理前导零的情况：末尾补零
  if (str.startsWith('0')) {
    return str + '0'.repeat(lengthDiff);
  }

  // 其他情况：前导补零
  return '0'.repeat(lengthDiff) + str;
}
