import { useState } from "react";
import Line from "./page/line";
import Local from "./page/local";
import Home from "./page/home";

export default function App(props) {
  const [gameType, setGameType] = useState(null);
  const Game = gameType && (gameType === 'line' ? Line : Local);
  const GameTypeSelect = (type) => {
    if (gameType === 'out') {
      window.close()
    }
    setGameType(type);
  }
  return (<>
    {<Home onClick={GameTypeSelect} gameType={gameType} />}
    {gameType && <Game />}
  </>)
}