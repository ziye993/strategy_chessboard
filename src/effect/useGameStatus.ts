import { useRef, useState, useEffect } from "react";
import Game from "../class/game";
import { useAuth } from "../contexts/AuthContext";
import { getUUID } from "../tool/utils";
import { IGameConfig, IGameInfo, IUseGameStatus } from "@/type/main.type";
import { IUpdate } from "@/type/game.type";
import loadWss from "./gamewss";
import { IMessageData } from "@/type/hooks.type";
import { TErrorType } from "@/type/error.type";



const useGameStatus = (canvasId: string, config: IGameConfig, onErrorMessage?: (messageData: IMessageData) => void): IUseGameStatus => {
  const { state: { user } = {} } = useAuth();
  const game = useRef<Game | null>(null);
  const [gameInfo, setGameInfo] = useState<IUpdate | undefined>(undefined);
  const canvasCtx = useRef<CanvasRenderingContext2D | null>(null);
  const gameWs = useRef<WebSocket | null>(null)
  useEffect(() => {
    const canvasDom = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvasCtx.current && canvasDom) {
      canvasCtx.current = canvasDom.getContext('2d');
    }
    if (canvasCtx.current && !game.current) {
      const getState = (newState: IUpdate) => {
        setGameInfo(newState);
      };

      if (config.gametype === 'line') {
        gameWs.current = loadWss();
        const ws = gameWs.current;
        const ctx = canvasCtx.current;

        if (!ws || !ctx) return;

        ws.onopen = () => {
          console.log('WebSocket连接已建立');

          game.current = new Game(ctx, { ...config }, user?.id || getUUID());
          game.current.releaseData = getState;
          game.current.updataState();

          ws.onmessage = (e) => {
            console.log(e.data, 'message');

            if (!game.current) throw new Error("game not init");

            const data = game.current.playerAction(e.data);

            onErrorMessage?.(data)
          };
        };

        ws.onclose = (event) => {
          console.log('连接已关闭', event.code, event.reason);
        };

        ws.onerror = (error) => {
          console.error('WebSocket错误:', error);
          onErrorMessage?.({
            error: TErrorType.WS_ERROR,
            message: '对局异常结束',
            time: Date?.now()
          })
        };

      } else {
        game.current = new Game(canvasCtx.current, { ...config }, undefined);
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
  const getCurrentSelect = (x: number, y: number) => game.current?.getHoverBlock(x, y)

  return { gameInfo, newGame, nextStep, startTrain, setAiInfo, paushTrain, stepTrain, startDemonstrate, setInterval, getCurrentSelect };
}

export default useGameStatus;