
import styles from './index.module.css'

const getServerStatusToCode = (matchData) => {
    const setverStatusMap = {
        'fully_loaded': { title: "污染", color: 'red' },
        'danger': { title: "混乱", color: 'yellow' },
        'normal': { title: "生长", color: 'great' }
    }
    return setverStatusMap[(matchData.serverStatus) || 'fully_loaded'];
}

export default function GameFooterBar(props) {
    const { matchData } = props;
    return <div className={styles["footer-info"]}>
        <div className={styles["server-status"]}>
            <span className={styles[`status-dot`]} style={{ color: getServerStatusToCode(matchData).color }}></span>
            <span className={styles["status-text"]}>服务器状态: {getServerStatusToCode(matchData).title}</span>
        </div>
        <div className={styles["game-version"]}>版本 {matchData.version}</div>
    </div>
}