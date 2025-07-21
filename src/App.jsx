import { useState } from "react";
import Line from "./page/line";
import Local from "./page/local";
import Home from "./page/home";


export default function App(props) {
  const [gameConfig, setGameConfig] = useState(null);
  const Game = gameConfig?.gametype && (gameConfig?.gametype === 'line' ? Line : Local);
  // const navigate = useNavigate();
  const GameTypeSelect = (config) => {
    if (config.gametype && config.mapSize) {
      setGameConfig({ ...config, complete: true });
      return
    }
    setGameConfig(config);
  }
  // useEffect(() => {
  //   navigate('/login')
  // }, [])


  return (<>
    {<Home create={GameTypeSelect} gameType={gameConfig?.gametype} />}
    {gameConfig?.complete && <Game gameConfig={gameConfig} />}
  </>)
}
