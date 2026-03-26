import { ILoginData, TOriginDataType } from "@/type/api.type";
import { post, get } from "./baseApi";
import { TAnyObject } from "@/type/globel.type";

export async function userLoginToPwd(data: ILoginData) {
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

export async function createCharacter(param: TAnyObject) {
  const res = await post('createCharacter', param);
  return res;
}

export async function getEmailCode(param: TAnyObject) {
  const res = await post('sendEmailCode', param);
  return res
}