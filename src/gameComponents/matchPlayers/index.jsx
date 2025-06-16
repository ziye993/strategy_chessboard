import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import { getMatchInfo as getMatchInfo_api, match, postLinePlayer } from '../../api/game';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import GameTopBar from '../gameTopBar';
import GameMatchContent from '../gameMatchContent';
import GameFooterBar from '../gameFooterBar';


const MultiplayerMatch = (props) => {
  const { state: { user } = {} } = useAuth();
  const { gameConfig } = props
  const nav = useNavigate();
  if (!user) {
    nav('/')
  }
  const [matchData, setMatchData] = useState({
    onlinePlayers: 0,
    estimatedWaitTime: 0,
    serverStatus: '',
    version: '',
  });

  //获取匹配信息
  const fetchMatchData = async () => {
    await postLinePlayer();
    const { data, code } = await getMatchInfo_api();
    if (code === 0) {
      setMatchData({
        onlinePlayers: data.numberOfOnlineUsers,
        estimatedWaitTime: data.estimatedWaitingTime,
        serverStatus: data.serverStatus,
        version: data.version,
      })
    }
  }

  // 进入游戏的处理函数
  const enterGame = (data) => {
    // 这里应该是进入游戏的逻辑
    props?.enterGame?.(data)
  };

  useEffect(() => {
    fetchMatchData();
  }, [])

  return (<>
    <div className="infection-bg"></div>
    <div className="match-container">
      {/* 顶部状态栏 */}
      <GameTopBar />
      {/* 主内容区域 */}
      <GameMatchContent {...{ matchData, enterGame, gameConfig }} />
      {/* 底部信息栏 */}
      <GameFooterBar matchData={matchData} />
    </div>
  </>
  );
};

export default MultiplayerMatch;
