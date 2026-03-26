export type TMathParams = { [x: string]: TOriginDataType; }

export type TOriginDataType = string | number | Symbol | boolean;

export interface ILoginData {
  username?: string, password?: string, email?: string, code?: string
}