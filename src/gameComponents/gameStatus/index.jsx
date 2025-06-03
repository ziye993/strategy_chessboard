// import SpanText from "../../components/SpanText";
// import SpanButton from "../../components/SpanButton";
// import "./index.css";
// import { useEffect } from "react";

// const statusMap = {
//   '': "开始",
//   0: "进攻",
//   1: "增殖",
// }
// const stepMap = {
//   0: "进攻完成",
//   1: "增殖完成",
// }

// export default function GameStatus(props) {
//   const { gameInfo, nextStep, newGame } = props;
//   const textConfig = {
//     content: statusMap[gameInfo?.currentRole?.actionType] || "开始",
//     nextstep: stepMap[gameInfo?.currentRole?.actionType] || "开始",
//     color: gameInfo?.currentRole?.color || "rgba(255,255,255,1)",
//     pointNumber: gameInfo?.currentRole?.fraction,
//     // winRole:gameInfo.winRole,
//   }
//   // useEffect(() => {
//   //   console.log(gameInfo, 'gameInfo')
//   // }, [])

//   return <div className="infoBlocks">
//     {/* <div className="currentRole">
//       <SpanText>当前回合</SpanText>
//       <span className="actionRoleColorBlock" style={{ backgroundColor: gameInfo.currentroleColor }} />
//     </div>
//     <div>
//       <SpanText>您现在可以：{gameInfo.cuStep === 0 ? '进攻/发育' : gameInfo.cuStep === 1 ? '增殖' : '观战'}</SpanText>
//     </div>
//     <SpanButton size="mini">关闭面板</SpanButton> */}
//     <p className="infoBlock stepinfo" onClick={nextStep} style={{ color: textConfig.color }}>
//       <span className="currentstep">{textConfig.content}</span>
//       <span className="nextstep">{textConfig.nextstep}</span>
//     </p>
//     <p className="infoBlock pointinfo" style={{ color: textConfig.color }}>
//       <span className="pointnumtext">点数</span>
//       <span className="pointNum">{textConfig.pointNumber || '0'}</span>
//     </p>
//     <p className="infoBlock pointinfo" style={{ color: textConfig.color }}>
//       <span className="pointnumtext">WIN</span>
//       <span className="pointNum">{gameInfo?.winRole?.name || "未结束"}</span>
//     </p>
//     <p className="infoBlock pointinfo" style={{ color: textConfig.color }}>
//       <span className="pointnumtext">
//         {gameInfo?.roles?.map((_, _i) => {
//           const size = '26px';
//           return <span key={`gi_${_i}`}
//             style={{
//               display: 'block',
//               fontSize: size,
//               height: size,
//               lineHeight: size,
//               color: `rgba(${_.color.join(',')})`,
//               border: `${gameInfo.currentRole.name === _.name ? '1px solid #FFF' : 'none'}`
//             }}
//           >
//             {_.name}
//           </span>
//         })}
//       </span>
//       <span className="pointNum">{gameInfo?.currentRole?.name || ''}</span>
//     </p>


//     <p className="infoBlock" onClick={newGame}>
//       新游戏
//     </p>
//   </div>
// }


import "./index.css";

const statuses = {
  unStart: { id: 1, name: '未开始', color: '#FFFFFF', icon: <i className="bi bi-caret-right-square"></i> },
  stop: { id: 1, name: '已暂停', color: '#4CAF50', icon: <i className="bi bi-caret-right-square"></i> },
  runing: { id: 2, name: '已开始', color: '#FFC107', icon: <i className="bi bi-pause"></i> },
  comp: { id: 3, name: '已完成', color: '#2196F3', icon: '✔' },
  fail: { id: 4, name: '已失败', color: '#F44336', icon: '✖' },
  pending: { id: 5, name: '待处理', color: '#9E9E9E', icon: '⌛' }
};

// ai进度
// 自动下棋
// 当前角色信息
// 游戏状态


const GameStatusIcon = (props) => {
  return <div className="status-icon" style={{ color: props?.color || statuses?.[props?.type]?.color }}>
    {props?.icon || statuses?.[props?.type]?.icon} <span className="status-text-content">{props.children} {props.suffix || statuses?.[props?.type]?.name}</span><span></span>
  </div>
}
const GameStatusProgress = (props) => {
  return <div className="status-percentage" style={{ color: statuses?.[props?.type]?.color }}>
    {props.children}%
  </div>
}

const GameStateBar = (props) => {
  return <div
    className={`status-card ${props?.className || ''}`}
    style={{ color: props?.color || statuses?.[props?.type]?.color, borderLeftColor: props?.color || statuses?.[props?.type]?.color || '#FFFFFF' }}
  >
    {props.children}
  </div>
}



const StatusDisplay = (props) => {
  const { gameInfo, nextStep, newGame, startTrain, paushTrain, stepTrain } = props;
  // console.log(gameInfo, 'gameInfo');
  const aiInfo = gameInfo.aiInfo;
  const setAiInfo = (otherInfo) => {
    props.setAiInfo({
      ...gameInfo,
      ...otherInfo
    })
  }
  // const textConfig = {
  //   content: statusMap[gameInfo?.currentRole?.actionType] || "开始",
  //   nextstep: stepMap[gameInfo?.currentRole?.actionType] || "开始",
  //   color: gameInfo?.currentRole?.color || "rgba(255,255,255,1)",
  //   pointNumber: gameInfo?.currentRole?.fraction,
  //   // winRole:gameInfo.winRole,
  // }
  const gameType = gameInfo?.isStart ? 'runing' : 'unStart';
  const aiType = aiInfo?.start ? (aiInfo?.training ? 'runing' : 'stop') : 'unStart';
  return (<div className="status-container">
    <GameStateBar type={gameType}>
      <GameStatusIcon type={gameType}>游戏</GameStatusIcon>
      <GameStatusIcon icon={<i className="bi bi-person-fill"></i>} type={gameType} suffix={'行动中'} color={gameInfo?.currentRole?.color}>{gameInfo?.currentRole?.name}</GameStatusIcon>
      <GameStatusIcon icon={<i className="bi bi-file-plus"></i>}>剩余点数: {gameInfo?.currentRole?.fraction}</GameStatusIcon>
      {/* <GameStatusProgress type={gameType}>0</GameStatusProgress> */}
      <div className="status-edit">
        <i class="bi bi-chevron-bar-right" onClick={aiInfo?.training ? nextStep : null}></i>
        <i class="bi bi-arrow-clockwise" onClick={newGame}></i>
      </div>
    </GameStateBar>

    <GameStateBar type={aiType}>
      <GameStatusIcon type={aiInfo?.start ? 'runing' : 'unStart'} icon={<i className="bi bi-cpu"></i>}> AI训练 </GameStatusIcon>
      <h3 className="status-name">目标：{aiInfo?.targetTrainNumber}</h3>
      <GameStatusProgress type={aiType}>{Math.floor((aiInfo?.currentTrainNumber || 0) / (aiInfo?.targetTrainNumber || 1))}</GameStatusProgress>
      <h3 className="status-name">奖/惩差</h3>
      <p className="status-count">attackRobot：{aiInfo?.attackRobot?.accumulatedRewards - aiInfo?.attackRobot?.accumulatedPunishment}</p>
      <p className="status-count">pftRobot：{aiInfo?.proliferationRobot?.accumulatedRewards - aiInfo?.proliferationRobot?.accumulatedPunishment}</p>
      <div className="status-edit">
        {aiInfo?.training ? <i className="bi bi-pause" onClick={paushTrain}></i> : <i className="bi bi-caret-right" onClick={startTrain}></i>}
        <i className="bi bi-fast-forward" onClick={aiInfo?.training ? stepTrain : null}></i>
        <i className="bi bi-gear" onClick={props.aiSetting}></i>
      </div>
    </GameStateBar>

    <GameStateBar type={aiInfo?.demonstrate ? 'runing' : 'unStart'}>
      <GameStatusIcon type={aiInfo?.demonstrate ? 'runing' : 'unStart'} icon={<i class="bi bi-pc-display-horizontal"></i>}> 演示模式 </GameStatusIcon>
      <div className="status-edit status-timeout">
        定时器 <i class="bi bi-dash-lg" onClick={() => props?.setInterval?.(-1)}></i><span>{(aiInfo?.interval / 1000) || '0'}</span><i class="bi bi-plus-lg" onClick={() => props?.setInterval?.(1)}></i>
      </div>
      <div className="status-edit">
        {aiInfo?.demonstrate ? <i className="bi bi-pause" onClick={props.startDemonstrate}></i> : <i className="bi bi-caret-right" onClick={props.startDemonstrate}></i>}
        {/* <i className="bi bi-fast-forward" onClick={aiInfo?.training ? stepTrain : null}></i> */}
        {/* <i className="bi bi-gear" onClick={props.aiSetting}></i> */}
      </div>
    </GameStateBar>

    <GameStateBar color={"#FFFFFF"} className="actionCompBar">
      <span className="actionComp" onClick={(aiInfo?.start || aiInfo?.demonstrate) ? null : nextStep}>完成行动</span>
    </GameStateBar>
  </div>)
};

export default StatusDisplay;  