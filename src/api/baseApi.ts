import message from "@/components/Modal/message";
import { TOriginDataType } from "@/type/api.type";
import { TAnyObject } from "@/type/globel.type";

/** 构建时可注入 VITE_API_BASE；留空则运行时走当前页面同源（Docker 下为 :30016） */
export const BASE_IP = (import.meta.env.VITE_API_BASE as string | undefined) || "";

const getBaseIp = () => BASE_IP || window.location.origin;

const BASE_PATH = "/infect";

// 处理请求错误
const handleError = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    console.log(response)
    return errorData;
  }
  return response.json();
};

// 发送 GET 请求
export const get = async (api: string, params?: { [x: string]: TOriginDataType } | undefined) => {
  const url = new URL(`${getBaseIp()}${BASE_PATH}/${api}`);
  if (params) {
    Object.keys(params).forEach(key => url.searchParams.append(key, (String(params[key]))));
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleError(response);
  } catch (error) {
    console.error('GET 请求错误:', error);
    message.error("请求失败，请检查网络，或稍后再试吧")
    return { res: false, message: "连接失败，请检查网络，或稍后再试吧" }
  }
};

// 发送 POST 请求
export const post = async (api: string, body: TAnyObject = {}, headers = {}) => {
  try {
    const response = await fetch(`${getBaseIp()}${BASE_PATH}/${api}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    });
    return handleError(response);
  } catch (error) {
    console.error('POST 请求错误:', error);
    message.error("请求失败，请检查网络，或稍后再试吧")
    return { res: false, message: "连接失败，请检查网络，或稍后再试吧" }
  }
};
