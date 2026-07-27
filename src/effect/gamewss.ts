import { getCookie } from "../tool/utils";

let gameWs: WebSocket | null = null;

const getWsBase = () => {
    const fromEnv = import.meta.env.VITE_WS_BASE as string | undefined;
    if (fromEnv) return fromEnv;
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${proto}//${window.location.host}`;
};

const loadWss = () => {
    if (gameWs) {
        return gameWs;
    } else {
        const tmptk = getCookie('tmptk')
        if (!tmptk) return null
        gameWs = new WebSocket(`${getWsBase()}/gameBattle?token=${encodeURIComponent(tmptk)}`);
        return gameWs
    }
}

export default loadWss
