import { MouseEventHandler, useEffect, useRef, useState } from 'react';
import { playRead, match, getGameData } from '../../api/game';
import styles from './index.module.css'
import useTimeCallback from '../../effect/useTimeCallback';
import { useAuth } from '../../contexts/AuthContext';
import { IMatchData } from '../gameFooterBar';
import { IGameConfig } from '@/type/main.type';
// 随机生成感染状态的描述
const statuses = [
  "扩散",
  "变异",
  "增殖",
  "进攻",
  "待命"
];
const infos = [
  "正在寻找其他变异体",
  "计算路径",
  "传输NDA",
  "传输RNA",
  "建立连接通道"
];

const getInfectionStatus = () => {
  return statuses[Math.floor(Math.random() * statuses.length)];
};

const getMatchInfo = () => {
  return infos[Math.floor(Math.random() * infos.length)];
};

interface IContentPrepareCardProps {
  matchData?: IMatchData;
  startMatch: MouseEventHandler<HTMLButtonElement>;
}

const ContentPrepareCard = ({ matchData, startMatch }: IContentPrepareCardProps) => {
  return <div className={styles["match-not-started"]}>
    <h2 className={styles["section-title"]}>多人对战</h2>
    <div className={styles["game-info"]}>
      <div className={styles["info-item"]}>
        <span className={styles["info-label"]}>在线玩家:</span>
        <span className={styles["info-value"]}>{matchData?.onlinePlayers + ""}</span>
      </div>
      <div className={styles["info-item"]}>
        <span className={styles["info-label"]}>预计等待时间:</span>
        <span className={styles["info-value"]}>{matchData?.estimatedWaitTime + ""} 秒</span>
      </div>
      <div className={styles["info-item"]}>
        <span className={styles["info-label"]}>状态:</span>
        <span className={styles["info-value"]}>{getInfectionStatus()}</span>
      </div>
    </div>
    <button
      className={styles["start-match-btn"]}
      onClick={startMatch}
    >
      开始匹配
    </button>
  </div>
}

const MatchIng = ({ }) => {
  const [matchText, setMatchText] = useState(0);
  const { startInterval } = useTimeCallback(() => {
    setMatchText(matchText + 1);
  }, 1000, true);

  useEffect(() => {
    startInterval();
  }, [])
  return <div className={styles["match-in-progress"]}>
    <h2 className={styles["section-title"]}>正在匹配</h2>
    <div className={styles["progress-text"]}>
      {matchText}
    </div>
    <div className={styles["virus-visualization"]}>
      <div className={styles["virus-particle particle-1"]}></div>
      <div className={styles["virus-particle particle-2"]}></div>
      <div className={styles["virus-particle particle-3"]}></div>
      <div className={styles["virus-particle particle-4"]}></div>
    </div>
  </div>
}

interface IMatchProps {
  players: string[];
  enterGame: () => void;
  errorBack: () => void;
}
const Match = ({ players, enterGame, errorBack }: IMatchProps) => {
  const [readProgress, setReadProgress] = useState(99.9);


  const { startInterval, endTimeCallback } = useTimeCallback(() => {
    if (readProgress < 0) {
      endTimeCallback();
    }
    setReadProgress(readProgress - 1);
  }, 300, true);

  useEffect(() => {
    startInterval()
  }, [])


  const eg = () => {
    endTimeCallback();
    setReadProgress(100)
    enterGame();
  }

  return <div className={styles["match-success"]}>
    <h2 className={styles["section-title"]}>{readProgress !== 100 ? '匹配成功!' : ' 等待其他玩家准备！'} </h2>
    <div className={styles["matched-player-info"]}>
      {players.map(_ => {
        return <div className={styles["player-details"]} key={`${_}`}>
          <div className={styles["player-name"]}>{_}</div>
          <div className={styles["player-stats"]}>
            <span className={styles["stat-item"]}>等级: {0}</span>
            <span className={styles["stat-item"]}>胜率: {0}</span>
          </div>
        </div>
      })}
      {/* <img
        src={matchedPlayer?.avatar}
        alt={matchedPlayer?.name}
        className={styles["matched-avatar"]}
      />
      <div className={styles["player-details"]}>
        <div className={styles["player-name"]}>{matchedPlayer?.name}</div>
        <div className={styles["player-stats"]}>
          <span className={styles["stat-item"]}>等级: {matchedPlayer.level}</span>
          <span className={styles["stat-item"]}>胜率: {matchedPlayer.winRate}</span>
        </div>
      </div> */}
    </div>
    <div className={styles["match-details"]}>
      <div className={styles["detail-item"]}>
        <span className={styles["detail-label"]}>感染类型:</span>
        <span className={styles["detail-value"]}>RNA病毒</span>
      </div>
      <div className={styles["detail-item"]}>
        <span className={styles["detail-label"]}>感染区域:</span>
        <span className={styles["detail-value"]}>肺部</span>
      </div>
      <div className={styles["detail-item"]}>
        <span className={styles["detail-label"]}>免疫强度:</span>
        <span className={styles["detail-value"]}>中等</span>
      </div>
    </div>
    {readProgress !== 100 && <><div className={styles["progress-container"]}>
      <div
        className={styles["progress-bar"]}
        style={{ width: `${readProgress}%` }}
      ></div>
    </div>
      <button
        className={styles["enter-game-btn"]}
        onClick={eg}
      >
        进入游戏
      </button></>}
  </div>
}

interface IProps {
  matchData?: IMatchData;
  gameConfig?: IGameConfig;
  enterGame?: (data: IGameConfig) => void;
}

export default function GameMatchContent(props: IProps) {
  const { state: { user } = {} } = useAuth();
  const [matchStatus, setMatchStatus] = useState(0);
  const [players, setPlayers] = useState([])
  const gameData = useRef({ poolId: null, self: null });
  const { matchData, gameConfig } = props;
  const [wait, setWait] = useState(false);

  const startMatch = async () => {
    setMatchStatus(1);
    const data = await match({ ...gameConfig, horizontalAxis: gameConfig?.mapSize || '', longitudinalAxis: gameConfig?.mapSize || '', targetPlayerNumer: 2 });
    if (data.code === 0) {
      gameData.current.poolId = data.data.id;
      gameData.current.self = user;
      setPlayers(data.data.users)
      setMatchStatus(2);
    } else {
      setMatchStatus(0)
    }
  }
  const enterGame = async () => {
    const data = await playRead({ id: gameData.current.poolId });
    if (data.code === 0 && data.data.mapdata) {
      props?.enterGame?.({ ...props.gameConfig, ...data.data.mapdata })
    }

  }
  return (
    <div className={styles["main-content"]}>
      {/* 匹配状态显示 */}
      {matchStatus === 0 && <ContentPrepareCard matchData={matchData} startMatch={startMatch} />}
      {matchStatus === 1 && <MatchIng />}
      {matchStatus === 2 && <Match players={players} enterGame={enterGame} errorBack={() => { setMatchStatus(0) }} />}
    </div>
  )
}