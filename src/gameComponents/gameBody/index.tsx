import React, { useEffect, useRef, useState } from "react";
import styles from './index.module.css'
import useGameStatus from "@/effect/useGameStatus";
import { useAuth } from "@/contexts/AuthContext";
import { useDragScroll } from "@/effect/useDragScroll";
import AiConfigUi from "@/QLearning/Ui";
import StatusDisplay from "../gameStatus";
import WinBox from "../winBox";
import { IGameConfig } from "@/type/main.type";

interface IProps {
  gameConfig: IGameConfig;
}

const stylesFormat = (str: string) => {
  const strArr = str.split(' ').map(_ => styles[_]).join(' ')
  return strArr
}

function GameBody(props: IProps) {
  const canvasDom = useRef<HTMLCanvasElement>(null);
  const [show, setShow] = useState(false);
  const { state: { user } = {} } = useAuth();
  const gameStatus = useGameStatus(stylesFormat("game"), props.gameConfig);
  const [modalOpen, setModalOpen] = useState(!!gameStatus?.gameInfo?.winRole);
  const dragRef = useDragScroll();

  useEffect(() => { setModalOpen(!!gameStatus?.gameInfo?.winRole || gameStatus?.gameInfo?.error) }, [gameStatus?.gameInfo]);
  useEffect(() => {
    const currentPoint = { x: 0, y: 0 };
    const mouseover = (e: any) => {
      console.log(e)
    }
    if (canvasDom.current) {
      canvasDom.current?.addEventListener("mouseover", mouseover)
    }
    return ()=>canvasDom.current?.removeEventListener('mouseover', mouseover)

  }, [canvasDom.current]);
  
  return <div className={stylesFormat("game_main")}>
    <AiConfigUi {...gameStatus} show={show} />
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