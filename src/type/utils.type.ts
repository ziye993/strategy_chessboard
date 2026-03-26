

export type TWorker = Worker;
// {
//   [x: string]: any;
//   onmessage: ((e: { data: { id: string; data: unknown; }; }) => void) | undefined;
//   postMessage: (...arg:any[]) => void;
// }

export interface ICenter {
  sideLength: number;
  relativeX: number;
  relativeY: number;
  size: number;
  x: number;
  y: number;
}
export type TCenters = ICenter[];