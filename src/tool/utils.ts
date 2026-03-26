import { TOriginDataType } from "@/type/api.type";
import { TPoint } from "@/type/game.type";

import { TWorker } from "@/type/utils.type";
import { v4 as uuidv4 } from "uuid";
export function isTrue(str: string | true) {
  return str === 'true' || str === true;
}



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
export function getDistance(point1: TPoint, point2: TPoint) {
  return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
}

let randomIndex = 0;
/**
 * 生成n个的随机数
 * @param {*} n 
 * @param {*} min 
 * @param {*} max 
 * @param {*} noRepeat 
 * @returns 
 */
export function getNsRandom(n: number, min = 0, max = 0, noRepeat = true) {
  if (min < 0 || max < 0) {
    return []
    // throw Error(`无法生成随机数::min:${min},max:${max}`)
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

export function logObjs(...arg: ({ [key: string]: TOriginDataType } | string)[]) {
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
      arr.push(objStr.join('') + '}');
    } else {
      arr.push(item);
    }
  });
}

/**
 * 生成某个区域内的随机数
 * @param {*} min 
 * @param {*} max 
 * @param {*} integer 
 * @returns 
 */
export function getLimitRandom(min: number, max: number, integer: boolean) {
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



type NDArray<T, N extends number[]> =
  N extends [infer First extends number, ...infer Rest extends number[]]
  ? NDArray<T, Rest>[]
  : T;
/** 创建n维数组 */
export function createNDArray<T, N extends number[]>(...dimsAndValue: [...N, T]): NDArray<T, N> {
  const dims = dimsAndValue.slice(0, -1) as N;
  const initialValue = dimsAndValue[dimsAndValue.length - 1] as T;

  return dims.reduceRight(
    (acc, dim) => Array(dim).fill(0).map(() => structuredClone(acc)),
    initialValue as any
  ) as NDArray<T, N>;
}

/**
 * 獲获取某个位置的值
 * @param arr 
 * @param dims 
 * @returns 
 */
export function visitNDArray<T>(arr: T[], ...dims: number[]): T[] | T {
  const [curr, ...dimsOther] = dims;
  if (!Array.isArray(arr)) {
    throw new Error('参数错误');
  } else if (dims.length === 0) {
    return arr;
  } else if (arr.length === 0) {
    throw new Error('请传入参数');
  }

  const currArr = arr[curr];
  if (dimsOther.length === 0) {
    return currArr;
  }

  if (Array.isArray(currArr)) {
    return visitNDArray(currArr, ...dimsOther);
  } else {
    if (dimsOther.length !== 0) {
      throw new Error('索引超出数组维度');
    } else {
      return currArr;
    }
  }
}
type TSetNDArray<T> = T | TSetNDArray<T>[];
/**
 * 
 * @param arr 设置n维数组
 * @param value 
 * @param indices 
 * @returns 
 */
export function setNDArray<T>(
  arr: TSetNDArray<T>[],
  value: T,
  ...indices: number[]
): TSetNDArray<T>[] {
  if (!Array.isArray(arr)) throw new Error('目标不是数组');

  const [curr, ...rest] = indices;
  if (curr === undefined) throw new Error('缺少索引');

  if (rest.length === 0) {
    arr[curr] = value;
    return arr;
  }

  if (!Array.isArray(arr[curr])) arr[curr] = [] as TSetNDArray<T>[];
  arr[curr] = setNDArray(arr[curr] as TSetNDArray<T>[], value, ...rest);
  return arr;
}

export function isEqual(objA?: any, objB?: any) {
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


export function saveQTable(filename: string, qTable: any[]) {
  localStorage.setItem(filename, JSON.stringify(qTable));
}

const isObject = (obj?: any) => (obj && typeof obj === 'object');

export function deepMerge<T, R>(target: T, source: R) {

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


let logHistory: string[] = [];
let isLog = false;
// let timeId = 10;
let currentTime = 0;
export function customLog(message: string) {
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

export function multiply(a: number, b: number) { //除法
  const scale = Math.pow(10, Math.max(
    (a.toString().split('.')[1] || '').length,
    (b.toString().split('.')[1] || '').length
  ));
  return (a * scale) * (b * scale) / (scale * scale);
}

const promiseTimeOut = 2000;

export function workerPromise(worker: TWorker, type: string, timeOut: number, ...data: any[]) {

  return new Promise((res, rej) => {
    const id = Math.random();
    worker.onmessage = (e: { data: { id: string; data: unknown; }; }) => {
      if (('' + e.data.id) === ('' + id)) {
        worker.onmessage = () => { };
        res(e.data.data);
        worker.onmessage = () => { }
      }
      else {
        console.warn(`id 错误: e.id:${e.data.id}, random.id:${id}`);
        console.log(e)
      };

    };
    worker.postMessage({ type: type, data: data, id });
    timeOut !== Infinity && setTimeout(() => rej("超时" + type,), timeOut || promiseTimeOut);
  });
}

export function workerfun(worker: TWorker, type: any, ...data: any[]) {
  worker.postMessage({ type: type, data: data })
}

export function aiLog(...param: any[]) {
  console.log(...param.map(_ => typeof _ === 'string' ? `[[ ${_} ]]` : _));
}

export function padNumber(input: any, targetLength: number) {
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
// 从Cookie中获取Toke
export function getCookie(name: string) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}
