import React, { useEffect, useRef, useState } from "react";
import styles from './index.module.css'
import useGameStatus from "../../effect/useGameStatus";
import StatusDisplay from "../gameStatus";
import AiConfigUi from "../../QLearning/Ui";
import WinBox from "../winBox";
import { useAuth } from "../../contexts/AuthContext";
import { useDragScroll } from "../../effect/useDragScroll";


const stylesFormat = (str) => {
    const strArr = str.split(' ').map(_ => styles[_]).join(' ')
    return strArr
}

function GameBody(props) {
    const canvasDom = useRef(null);
    const [show, setShow] = useState(false);
    const { state: { user } = {} } = useAuth();
    const gameStatus = useGameStatus(stylesFormat("game"), props.gameConfig);
    const [modalOpen, setModalOpen] = useState(!!gameStatus?.gameInfo?.winRole);
    const dragRef = useDragScroll();
    useEffect(() => { setModalOpen(!!gameStatus?.gameInfo?.winRole || gameStatus?.gameInfo?.error) }, [gameStatus?.gameInfo]);

    return <div className={stylesFormat("game_main")}>
        <AiConfigUi {...gameStatus} show={show} onClick={() => { setShow(prev => !prev) }} />
        <div id={stylesFormat("canvasBox")} ref={dragRef}>
            <canvas id={stylesFormat("game")} ref={canvasDom} width="0" height="0" />
        </div>
        <StatusDisplay {...gameStatus} aiSetting={() => { setShow(prev => !prev) }} />
        <WinBox isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="游戏结束！"
            onConfirm={() => {
                setModalOpen(false);
            }}
        >
            <p className={stylesFormat("winText")}>{gameStatus?.gameInfo?.winRole?.name ? "胜利者：" : ''} {gameStatus?.gameInfo?.winRole?.name || gameStatus?.gameInfo?.error} </p>
        </WinBox>
    </div>
}

export default GameBody;