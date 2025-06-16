import { post, get } from "./baseApi";

export async function getGameMap(param) {
    const res = await get('getGameMap', param);
    return res
}

export async function getMatchInfo() {
    const res = await get('getMatchInfo');
    return res
}

export async function match(param) {
    const res = await get('match', param);
    return res
}

export async function postLinePlayer() {
    const res = await post('addLinePlayer');
    return res
}
// playRead
export async function playRead(param) {
    const res = await post('playRead', param);
    return res
}

export async function getGameData(param) {
    const res = await get('getGameData', param);
    return res
}
