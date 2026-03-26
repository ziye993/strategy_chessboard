import { TMathParams } from "@/type/api.type";
import { post, get } from "./baseApi";

export async function getGameMap(param: { [x: string]: string; } | undefined) {
    const res = await get('getGameMap', param);
    return res
}

export async function getMatchInfo() {
    const res = await get('getMatchInfo');
    return res
}

export async function match(param?: TMathParams) {
    const res = await get('match', param);
    return res
}

export async function postLinePlayer() {
    const res = await post('addLinePlayer');
    return res
}
// playRead
export async function playRead(param: {} | undefined) {
    const res = await post('playRead', param);
    return res
}

export async function getGameData(param: { [x: string]: string; } | undefined) {
    const res = await get('getGameData', param);
    return res
}
