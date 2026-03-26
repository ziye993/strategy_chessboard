
import styles from './index.module.css'

export interface IMatchData {
    serverStatus?: 'fully_loaded' | 'danger' | 'normal',
    version?: string;
    onlinePlayers?: number;
    estimatedWaitTime?: number;
}
interface IProps {
    matchData?: IMatchData
}

const getServerStatusToCode = (matchData: IMatchData) => {
    const setverStatusMap = {
        'fully_loaded': { title: "污染", color: 'red' },
        'danger': { title: "混乱", color: 'yellow' },
        'normal': { title: "生长", color: 'great' }
    }
    return setverStatusMap?.[(matchData.serverStatus) || 'fully_loaded'];
}

export default function GameFooterBar(props: IProps) {
    const { matchData = {} } = props;
    return <div className={styles["footer-info"]}>
        <div className={styles["server-status"]}>
            <span className={styles[`status-dot`]} style={{ color: getServerStatusToCode(matchData).color }}></span>
            <span className={styles["status-text"]}>服务器状态: {getServerStatusToCode(matchData).title}</span>
        </div>
        <div className={styles["game-version"]}>版本 {matchData.version}</div>
    </div>
}