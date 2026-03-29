import { getCookie } from "../tool/utils";

let gameWs: WebSocket | null = null;

const loadWss = () => {
    if (gameWs) {
        return gameWs;
    } else {
        const tmptk = getCookie('tmptk')
        if (!tmptk) return null
        gameWs = new WebSocket(`ws://192.168.0.105:3001/gameBattle?token=${encodeURIComponent(tmptk)}`);
        return gameWs
    }
}

export default loadWss