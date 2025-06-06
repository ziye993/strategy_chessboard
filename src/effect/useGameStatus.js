
import { useRef, useState, useEffect } from "react";
import Game from "../class/game";

const useGameStatus = (ctx) => {
  const game = useRef(null);
  const [gameInfo, setGameInfo] = useState({});
  useEffect(() => {
    if (ctx.current && !game.current) {
      const getState = (newState) => {
        setGameInfo(newState);
      };
      game.current = new Game(ctx.current, getState);
      if (game.current.error) {
        console.error(game.current.error)
      }
    }
  }, [ctx]);

  const setAiInfo = game.current?.ai?.setAiInfo.bind(game.current?.ai);
  const newGame = game.current?.newGame.bind(game.current);
  const startTrain = game.current?.ai?.train.bind(game.current?.ai);
  const paushTrain = game.current?.ai?.paushTrain.bind(game.current?.ai);
  const nextStep = game.current?.nextStep.bind(game.current);
  const stepTrain = game.current?.ai?.stepTrain.bind(game.current?.ai);
  const startDemonstrate = game.current?.ai?.startDemonstrate.bind(game.current?.ai);
  const setInterval = game.current?.ai?.setInterval.bind(game.current?.ai);

  return { gameInfo, newGame, nextStep, startTrain, setAiInfo, paushTrain, stepTrain, startDemonstrate, setInterval };
}

export default useGameStatus;