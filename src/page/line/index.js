import React, { useEffect, useRef, useState } from "react";
import styles from './index.module.css'
import useCanvasInit from "../../effect/canvasInit";
import GameStatus from "../../gameComponents/gameStatus";
import AiUi from "../../QLearning/Ui";
import useGameStatus from "../../effect/useGameStatus";
import WinBox from "../../gameComponents/winBox";
console.log(styles)
const stylesFormat = (str) => {
  const strArr = str.split(' ').map(_ => styles[_]).join(' ')
  return strArr
}

function Line(props) {
  const canvasDom = useRef(null);
  const [show, setShow] = useState(false);
  const ctx = useCanvasInit(canvasDom);
  const gameStatus = useGameStatus(ctx);
  const [modalOpen, setModalOpen] = useState(!!gameStatus?.gameInfo?.winRole);

  useEffect(() => { setModalOpen(!!gameStatus?.gameInfo?.winRole || gameStatus?.gameInfo?.error) }, [gameStatus?.gameInfo]);


  return <div className={stylesFormat("game_main")}>
    <AiUi {...gameStatus} show={show} onClick={() => { setShow(prev => !prev) }} />
    <div id={stylesFormat("canvasBox")}
    ><canvas id={stylesFormat("game")} ref={canvasDom} width="0" height="0" />
    </div>
    <GameStatus {...gameStatus} aiSetting={() => { setShow(prev => !prev) }} />
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

export default Line;
