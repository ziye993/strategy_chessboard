import { IUseGameStatus } from "@/type/main.type";
import "./index.css";
import { ReactNode, } from "react";

enum StatusType {
  "unStart" = "unStart",
  "stop" = "stop",
  "runing" = "runing",
  "comp" = "comp",
  "fail" = "fail",
  "pending" = "pending",
}

interface IStatusItem {
  id: number;
  name: string;
  color: string;
  icon: ReactNode;
}

type IStatusMap = {
  [key in StatusType]: IStatusItem;
}

const statuses: IStatusMap = {
  unStart: { id: 1, name: '未开始', color: '#FFFFFF', icon: <i className="bi bi-caret-right-square"></i> },
  stop: { id: 1, name: '已暂停', color: '#4CAF50', icon: <i className="bi bi-caret-right-square"></i> },
  runing: { id: 2, name: '已开始', color: '#FFC107', icon: <i className="bi bi-pause"></i> },
  comp: { id: 3, name: '已完成', color: '#2196F3', icon: '✔' },
  fail: { id: 4, name: '已失败', color: '#F44336', icon: '✖' },
  pending: { id: 5, name: '待处理', color: '#9E9E9E', icon: '⌛' }
} as const;

// ai进度
// 自动下棋
// 当前角色信息
// 游戏状态


interface IGAMEStatusIcon {
  color?: string;
  type?: StatusType;
  icon?: ReactNode;
  children?: ReactNode | string;
  suffix?: ReactNode;
  className?: string;
  onClick?: () => void;
}
const GameStatusIcon = (props: IGAMEStatusIcon) => {
  return <div className="status-icon" style={{ color: props?.color || (props?.type && statuses?.[props?.type]?.color) || undefined }} onClick={props?.onClick} >
    {props?.icon || (props?.type && statuses?.[props?.type]?.icon)} <span className="status-text-content">{props.children} {props.suffix || (props?.type && statuses?.[props?.type]?.name)}</span><span></span>
  </div>
}
const GameStatusProgress = (props: IGAMEStatusIcon) => {
  return <div className="status-percentage" style={{ color: props?.type && statuses?.[props?.type]?.color }}>
    {props.children}%
  </div>
}

const GameStateBar = (props: IGAMEStatusIcon) => {
  return <div
    className={`status-card ${props?.className || ''}`}
    style={{ color: props?.color || (props?.type && statuses?.[props?.type]?.color), borderLeftColor: props?.color || (props?.type && statuses?.[props?.type]?.color) || '#FFFFFF' }}
  >
    {props.children}
  </div>
}


interface IProps {
  aiSetting: () => void;
}
const StatusDisplay = (props: IProps & IUseGameStatus) => {
  const { gameInfo, nextStep, newGame, startTrain, paushTrain, stepTrain } = props;
  const aiInfo = gameInfo?.aiInfo;
  const setAiInfo = (otherInfo: { animation: boolean }) => {
    props?.setAiInfo?.({
      ...(gameInfo || {}),
      ...otherInfo
    })
  }
  // const textConfig = { // gameType
  //   content: statusMap[gameInfo?.currentRole?.actionType] || "开始",
  //   nextstep: stepMap[gameInfo?.currentRole?.actionType] || "开始",
  //   color: gameInfo?.currentRole?.color || "rgba(255,255,255,1)",
  //   pointNumber: gameInfo?.currentRole?.fraction,
  //   // winRole:gameInfo.winRole,
  // }
  const gameType = !!gameInfo?.isStart ? StatusType.runing : StatusType.unStart;
  const aiType = !!aiInfo?.start ? (aiInfo?.training ? StatusType.runing : StatusType.stop) : StatusType.unStart;
  return (<div className="status-container">
    <GameStateBar type={gameType}>
      <GameStatusIcon type={gameType}>游戏</GameStatusIcon>
      <GameStatusIcon icon={<i className="bi bi-person-fill"></i>} type={gameType} suffix={'行动中'} color={gameInfo?.currentRole?.color}>{gameInfo?.currentRole?.name + ''}</GameStatusIcon>
      <GameStatusIcon icon={<i className="bi bi-file-plus"></i>}>剩余点数: {gameInfo?.currentRole?.fraction}</GameStatusIcon>
      {/* <GameStatusProgress type={gameType}>0</GameStatusProgress> */}
      <div className="status-edit">
        <i className="bi bi-chevron-bar-right" onClick={() => (!aiInfo?.training && stepTrain?.())}></i>
        <i className="bi bi-arrow-clockwise" onClick={() => newGame?.()}></i>
      </div>
    </GameStateBar>

    <GameStateBar type={gameType}>
      <GameStatusIcon type={gameType} onClick={() => { setAiInfo({ animation: false }) }}>动画</GameStatusIcon>
    </GameStateBar>

    {gameInfo?.gameType === 'local' && <GameStateBar type={aiType}>
      <GameStatusIcon type={aiInfo?.start ? StatusType.runing : StatusType.unStart} icon={<i className="bi bi-cpu"></i>}> AI训练 </GameStatusIcon>
      <h3 className="status-name">目标：{aiInfo?.targetTrainNumber}</h3>
      <GameStatusProgress type={aiType}>{Math.floor(((aiInfo?.currentTrainNumber || 0)) / (aiInfo?.targetTrainNumber || 1) * 100)}</GameStatusProgress>
      <h3 className="status-name">奖/惩差</h3>
      <p className="status-count">attackRobot：{(aiInfo?.attackRobot?.accumulatedRewards || 0) - (aiInfo?.attackRobot?.accumulatedPunishment || 0)}</p>
      <p className="status-count">pftRobot：{(aiInfo?.proliferationRobot?.accumulatedRewards || 0) - (aiInfo?.proliferationRobot?.accumulatedPunishment || 0)}</p>
      <div className="status-edit">
        {aiInfo?.training ? <i className="bi bi-pause" onClick={paushTrain}></i> : <i className="bi bi-caret-right" onClick={startTrain}></i>}
        <i className="bi bi-fast-forward" onClick={() => (!aiInfo?.training && stepTrain?.())}></i>
        <i className="bi bi-gear" onClick={props.aiSetting}></i>
      </div>
    </GameStateBar>
    }

    {gameInfo?.gameType === 'local' && <GameStateBar type={aiInfo?.demonstrate ? StatusType.runing : StatusType.unStart}>
      <GameStatusIcon type={aiInfo?.demonstrate ? StatusType.runing : StatusType.unStart} icon={<i className="bi bi-pc-display-horizontal"></i>}> 演示模式 </GameStatusIcon>
      <div className="status-edit status-timeout">
        定时器 <i className="bi bi-dash-lg" onClick={() => props?.setInterval?.(-1)}></i><span>{((aiInfo?.interval || 0) / 1000) || '0'}</span><i className="bi bi-plus-lg" onClick={() => props?.setInterval?.(1)}></i>
      </div>
      <div className="status-edit">
        {aiInfo?.demonstrate ? <i className="bi bi-pause" onClick={props.startDemonstrate}></i> : <i className="bi bi-caret-right" onClick={props.startDemonstrate}></i>}
        {/* <i className="bi bi-fast-forward" onClick={aiInfo?.training ? stepTrain : null}></i> */}
        {/* <i className="bi bi-gear" onClick={props.aiSetting}></i> */}
      </div>
    </GameStateBar>}

    <GameStateBar color={"#FFFFFF"} className="actionCompBar">
      <span className="actionComp" onClick={() => (!(aiInfo?.start || aiInfo?.demonstrate) && nextStep?.())}> 完成行动</span>
    </GameStateBar>
  </div >)
};

export default StatusDisplay;  