import { useState } from "react";
import Home from "./page/home";
import Line from "./page/line";
import Local from "./page/local";
import { IGameConfig } from "./type/main.type";


export default function App() {
  const [gameConfig, setGameConfig] = useState<IGameConfig>({});
  const GameComponents: React.FC<{ gameConfig: IGameConfig }> = gameConfig?.gametype === 'line' ? Line : Local;
  // const navigate = useNavigate();
  const GameTypeSelect = (config: IGameConfig) => {
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
    {gameConfig?.complete && <GameComponents gameConfig={gameConfig} />}
  </>)
}
