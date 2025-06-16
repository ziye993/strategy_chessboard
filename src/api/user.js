import { post, get } from "./baseApi";

export async function userLoginToPwd(data) {
  const { username, password, email, code } = data;
  const res = await post('login', { username, password, email, code });
  if (res.res) localStorage.setItem('loginStatus', 'true');
  return res;
}

export async function userLoginToToken() {
  const res = await post('loginToToken', {});
  return res;
}

export async function getCharacterInfo() {
  const res = await get('getCharacterInfo');
  return res;
}

export async function createCharacter(param) {
  const res = await post('createCharacter', param);
  return res;
}

export async function getEmailCode(param) {
  const res = await post('sendEmailCode', param);
  return res
}