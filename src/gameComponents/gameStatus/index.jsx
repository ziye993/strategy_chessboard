import SpanText from "../../components/SpanText";
import SpanButton from "../../components/SpanButton";
import "./index.css";

const statusMap = {
  '': "开始",
  0: "进攻",
  1: "增殖",
}
const stepMap = {
  0: "进攻完成",
  1: "增殖完成",
}

export default function GameStatus(props) {
  const { gameInfo, gameStatusClick, newGame } = props;
  const textConfig = {
    content: statusMap[gameInfo.cuStep] || "开始",
    nextstep: stepMap[gameInfo.cuStep] || "开始",
    color: gameInfo.currentroleColor || "rgba(255,255,255,1)",
    pointNumber: gameInfo.pointNumber,
  }
  return <div className="infoBlocks">
    {/* <div className="currentRole">
      <SpanText>当前回合</SpanText>
      <span className="actionRoleColorBlock" style={{ backgroundColor: gameInfo.currentroleColor }} />
    </div>
    <div>
      <SpanText>您现在可以：{gameInfo.cuStep === 0 ? '进攻/发育' : gameInfo.cuStep === 1 ? '增殖' : '观战'}</SpanText>
    </div>
    <SpanButton size="mini">关闭面板</SpanButton> */}
    <p className="infoBlock stepinfo" onClick={gameStatusClick} style={{ color: textConfig.color }}>
      <span className="currentstep">{textConfig.content}</span>
      <span className="nextstep">{textConfig.nextstep}</span>
    </p>
    <p className="infoBlock pointinfo" style={{ color: textConfig.color }}>
      <span className="pointnumtext">点数</span>
      <span className="pointNum">{textConfig.pointNumber || '0'}</span>
    </p>
    <p className="infoBlock" onClick={newGame}>
      新游戏
    </p>
  </div>
}