export type TAnyObject = {
  [key: string]: any;
}
export type TId = number | string | Symbol;

export type TClassData<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K]
};