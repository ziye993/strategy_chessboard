import { useEffect, useState } from "react";
import Line from "./page/line";
import Local from "./page/local";
import Home from "./page/home";
import useWssTest from "./effect/useWssTest";
import { useNavigate } from "react-router-dom";

export default function App(props) {
  const [gameType, setGameType] = useState(null);
  const Game = gameType && (gameType === 'line' ? Line : Local);
  const navigate = useNavigate();
  const GameTypeSelect = (config) => {
    setGameType(config.gametype);
  }
  useWssTest();
  useEffect(() => {
    navigate('/login')
  }, [])

  return (<>
    {<Home creat={GameTypeSelect} gameType={gameType} />}
    {gameType && <Game />}
  </>)
}