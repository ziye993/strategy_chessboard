import { useAuth } from "../../contexts/AuthContext";
import styles from './index.module.css'

export default function GameTopBar(props) {
    const { state: { user } = {} } = useAuth();
    return (
        <div className={styles["status-bar"]}>
            <div className={styles["logo"]}>INFECT</div>
            <div className={styles["user-info"]}>
                <img src="https://picsum.photos/id/1012/50/50" alt="玩家头像" className={styles["user-avatar"]} />
                <div className="user-details">
                    <div className={styles["user-name"]}>{user?.username}</div>
                    <div className={styles["user-level"]}>{user?.lv || ''}</div>
                </div>
            </div>
        </div>
    )
}