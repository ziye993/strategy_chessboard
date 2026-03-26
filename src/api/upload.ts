import { TAnyObject } from "@/type/globel.type";


const url = 'http://localhost:3001/infect'
/**
 * 极简JSON上传函数
 * @param {Object|Array} data - 要上传的对象或数组
 * @param {string} url - API地址
 * @returns {Promise<Object>} - 响应数据
 */
export async function postJSON(api: string, data: TAnyObject) {
  try {
    const response = await fetch(url + api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('JSON上传失败:', error);
    throw error;
  }
}
