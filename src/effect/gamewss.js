import { getCookie } from "../tool/utils";

let gameWs = null;

const loadWss = () => {
    if (gameWs) {
        return gameWs;
    } else {
        const tmptk = getCookie('tmptk')
        gameWs = new WebSocket(`ws://192.168.0.104:3001/gameBattle?token=${encodeURIComponent(tmptk)}`);
        return gameWs
    }
}

export default loadWss