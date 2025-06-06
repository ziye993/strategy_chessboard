import { post, get } from "./baseApi";

export async function userLoginToPwd(data) {
  const { username, password, email, code } = data;
  const res = await post('loginToPws', { username, password, email, code });
  if (res.res) localStorage.setItem('loginStatus', 'true');
  return res;
}

export async function userLoginToToken() {
  const res = await post('/login', {});
  return res;
}

export async function getCharacterInfo() {
  const res = await get('/getCharacterInfo');
  return res;
}

export async function createCharacter(param) {
  const res = await post('/createCharacter', param);
  console.log(res, 'res')
  return res;
}