import React, { useRef, useState } from "react";
import MultiplayerMatch from "../../gameComponents/matchPlayers";
import GameBody from "../../gameComponents/gameBody";

function Line(props) {
  const gameConfig = useRef({})
  const [matchSuccessful, setMatchSuccessful] = useState(false);

  if (matchSuccessful === false) {
    return <MultiplayerMatch gameConfig={props.gameConfig} enterGame={(data) => {
      gameConfig.current = { ...props.gameConfig, ...data }
      setMatchSuccessful(true);
    }} />
  } else {
    return <GameBody gameConfig={gameConfig.current} />
  }
}

export default Line;
