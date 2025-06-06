const BASE_URL = 'http://localhost:3001/infect'; // 替换为你的 API 基础地址

// 处理请求错误
const handleError = async (response) => {
  if (!response.ok) {
    const errorData = await response.json();
    console.log(response)
    return errorData;
  }
  return response.json();
};

// 发送 GET 请求
export const get = async (api, params) => {
  const url = new URL(`${BASE_URL}/${api}`);
  // 添加查询参数
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
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
    return { res: false, message: "连接失败，请检查网络，或稍后再试吧" }
  }
};

// 发送 POST 请求
export const post = async (api, body = {}, headers = {}) => {
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
    return { res: false, message: "连接失败，请检查网络，或稍后再试吧" }
  }
};
