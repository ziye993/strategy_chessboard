
import { useDragScroll } from '@/effect/useDragScroll';
import useGameStatus from '@/effect/useGameStatus';
import GameStatus from '@/gameComponents/gameStatus';
import WinBox from '@/gameComponents/winBox';
import { useRef, useState, useEffect } from 'react';
import styles from './index.module.css'
import AiConfigUi from '@/QLearning/Ui';
import { IGameConfig } from '@/type/main.type';
import Block from '@/class/block';


const stylesFormat = (str: string) => {
  const strArr = str.split(' ').map(_ => styles[_]).join(' ')
  return strArr
}

const Local: React.FC<{ gameConfig: IGameConfig }> = (props) => {
  const canvasDom = useRef<HTMLCanvasElement | null>(null);
  const [show, setShow] = useState(false);
  const dragRef = useDragScroll();
  const gameStatus = useGameStatus(stylesFormat("game"), props.gameConfig);
  const [modalOpen, setModalOpen] = useState<boolean>(!!gameStatus?.gameInfo?.winRole);
  const [showTip, setShowTip] = useState<{ open: boolean, data: Block & { x: number, y: number } & any }>({ open: false, data: { count: '0', x: 0, y: 0 } });
  useEffect(() => { setModalOpen(!!gameStatus?.gameInfo?.winRole || !!gameStatus?.gameInfo?.error) }, [gameStatus?.gameInfo]);

  useEffect(() => {
    const currentPoint = { x: 0, y: 0 };
    const timeOut = undefined;
    let id: any = undefined;
    const mouseover = (e: any) => {
      // currentPoint.x = e.x;
      // currentPoint.y = e.y;
      clearTimeout(id);
      setShowTip(prev => ({ ...prev, open: false, data: { ...prev.data, x: e.x, y: e.y } }));
      id = setTimeout(() => {
        setShowTip(prev => {
          const currentBlock = gameStatus.getCurrentSelect(e.x, e.y);
          console.log(currentBlock, 'c')
          if (currentBlock) {
            return ({
              ...prev, open: true,
              data: {
                realIndex: ('' + currentBlock?.content) || '',
                _isRefresh: ('' + currentBlock?._isRefresh) || '',
                index: ('' + currentBlock?.index) || '',
                i: ('' + currentBlock?.i) || '',
                count: ('' + currentBlock?.content) || '',
                maxSize: ('' + currentBlock.maxSize) || '',
                x: e.x,
                y: e.y,
              }
            })
          }
          return { ...prev, open: true, data: {} }
        });


      }, 300);
    }
    if (canvasDom.current) {
      canvasDom.current?.addEventListener("mousemove", mouseover)
    }
    return () => canvasDom.current?.removeEventListener('mousemove', mouseover)

  }, [canvasDom.current]);

  return <div className={stylesFormat("game_main")}>
    <AiConfigUi {...gameStatus} show={show} />
    <div id={stylesFormat("canvasBox")} ref={dragRef}>
      <canvas id={stylesFormat("game")} ref={canvasDom} width="0" height="0" />
    </div>
    <div className={styles.tipBox} style={{ transform: `translateX(${showTip.data.x}px) translateY(${showTip.data.y}px)`, zIndex: showTip.open ? 999 : 1, opacity: showTip.open ? 1 : 0 }}>
      <p>count: {String(showTip.data?.count) || ' '}</p>
      <p>maxsize: {String(showTip.data?.maxSize) || ' '}</p>
      <p>realIndex: {String(showTip.data?.realIndex) || ' '}</p>
      {/* <p>_isRefresh:{String(showTip.data?._isRefresh) || ' '}</p> */}
      <p>index: {String(showTip.data?.index) || ' '}</p>
      <p>i: {String(showTip.data?.i) || ' '}</p>
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

export default Local;