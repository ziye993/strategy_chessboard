import message from "@/components/Modal/message";
import { TOriginDataType } from "@/type/api.type";
import { TAnyObject } from "@/type/globel.type";

export const BASE_IP = "http://localhost:3001";

const BASE_URL = BASE_IP + '/infect'; // 

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
  const url = new URL(`${BASE_URL}/${api}`);
  if (params) {
    Object.keys(params).forEach(key => url.searchParams.append(key, (String(params[key]))));
  }
  // 添加查询参数

  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',  // 确保 Cookie 会随请求发送
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
    const response = await fetch(`${BASE_URL}/${api}`, {
      method: 'POST',
      credentials: 'include',  // 确保 Cookie 会随请求发送
      headers: {
        'Content-Type': 'application/json',
        ...headers, // 可以添加额外的请求头
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
