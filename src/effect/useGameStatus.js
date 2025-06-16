import { useRef, useState, useEffect } from "react";
import Game from "../class/game";
import { useAuth } from "../contexts/AuthContext";
import loadWss from "./gamewss";
import { getUUID } from "../tool/utils";


const useGameStatus = (canvasId, config) => {
  const { state: { user } = {} } = useAuth();
  const game = useRef(null);
  const [gameInfo, setGameInfo] = useState({});
  const canvasCtx = useRef(null);
  const gameWs = useRef()
  useEffect(() => {
    const canvasDom = document.getElementById(canvasId);
    if (!canvasCtx.current && canvasDom) {
      canvasCtx.current = canvasDom.getContext('2d');
    }
    if (canvasCtx.current && !game.current) {
      const getState = (newState) => {
        setGameInfo(newState);
      };

      if (config.gametype === 'line') {
        gameWs.current = loadWss()
        window.gameWs = gameWs;
        gameWs.current.onopen = () => {
          console.log('WebSocket连接已建立');
          game.current = new Game(canvasCtx.current, { ...config }, user?.id || getUUID());
          game.current.releaseData = getState;
          game.current.updataState();
          gameWs.current.onmessage = (e) => {
            console.log(e.data, 'message')
            game.current.playerAction(e.data);
          }
        };
        gameWs.current.onclose = (event) => {
          console.log('连接已关闭', event.code, event.reason);
          // 可添加重连逻辑
        };

        // 错误处理
        gameWs.current.onerror = (error) => {
          console.error('WebSocket错误:', error);
        };

      } else {
        game.current = new Game(canvasCtx.current, { ...config }, null);
        game.current.releaseData = getState;
        game.current.updataState();
      }
    }
  }, [gameWs]);

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