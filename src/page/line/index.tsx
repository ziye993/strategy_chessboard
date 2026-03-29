import GameBody from "@/gameComponents/gameBody";
import MultiplayerMatch from "@/gameComponents/matchPlayers";
import { IGameConfig } from "@/type/main.type";
import React, { useRef, useState } from "react";

interface IProps {
  gameConfig: IGameConfig
}

const Line: React.FC<{ gameConfig: IGameConfig }> = (props: IProps) => {
  const gameConfig = useRef<IGameConfig>({});
  const [matchSuccessful, setMatchSuccessful] = useState(false);

  if (matchSuccessful === false) {
    return <MultiplayerMatch gameConfig={props.gameConfig} enterGame={(data: IGameConfig) => {
      gameConfig.current = { ...props.gameConfig, ...data }
      setMatchSuccessful(true);
    }} />
  } else {
    return <GameBody gameConfig={gameConfig.current} goMatchHome={() => { setMatchSuccessful(false) }} />
  }
}

export default Line;
