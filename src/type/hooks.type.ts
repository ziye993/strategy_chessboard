import { TErrorType } from "./error.type";

export interface IMessageData {
  error: TErrorType;
  message: string;
  [key: string]: any;
}