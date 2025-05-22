import React, { useEffect, useRef, useState } from "react";
import './App.css'
import SpanButton from "./components/SpanButton";
import useCanvasInit from "./effect/canvasInit";
import Game from "./class/game";
import { logObjs } from "./tool/utils";
import SpanText from "./components/SpanText";
import GameMask from "./gameComponents/startMask";
import GameStatus from "./gameComponents/gameStatus";
import GameConfig from "./gameComponents/gameConfig";
import ConfigUi from "./QLearning/Ui";
import QLearningAgent from "./QLearning";
function App(props) {
  const canvasDom = useRef(null);
  const [start, setStart] = useState(false);
  const [show, setShow] = useState(false);
  const ctx = useCanvasInit(canvasDom);
  const game = useRef(null);
  const [gameInfo, SGI] = useState({});
  const qL = useRef(null)

  const setGameInfo = (gi) => {
    SGI(() => {
      return { ...gameInfo, ...gi }
    })
  }
  useEffect(() => {
    if (ctx.current && !game.current) {
      ctx.current.imageSmoothingEnabled = true;
      game.current = new Game(ctx.current);
      game.current.init();
      game.current.update((data) => {
        if (data.isStart === true) {
          setGameInfo({
            currentroleColor: `rgba(${data.roles?.[data.currentActionRole].linghColor.join(',')})`,
            cuStep: data.roles?.[data?.currentActionRole]?.currentStep,
            pointNumber: data.roles?.[data?.currentActionRole].fraction,
          });
          logObjs(game.current.roles[0], game.current.roles[1], game.current.roles[2])
        }
      });
      // qL.current = new QLearningAgent(game.current,)
    }
  }, [ctx]);

  const gameStatusClick = () => {
    if (!game.current.isStart) {
      game.current.start();
    } else {
      game.current.nextSetp();
    }
  }

  const newGame = () => {
    console.log('newGame')
    game.current.init();
  }

  return <div className="game_main">
    <GameStatus gameInfo={gameInfo} gameStatusClick={gameStatusClick} newGame={newGame} />
    <ConfigUi show={show} onClick={() => { setShow(prev => !prev) }} />
    <canvas id={"game"} ref={canvasDom} />
  </div>
}

export default App;
