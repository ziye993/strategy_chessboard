import styles from './index.module.css';
import { deepMerge } from "../../tool/utils";
import { IUseGameStatus } from '@/type/main.type';

interface IProps {
  show: boolean;
  // onClick: () => void;
};

interface IRobootData {
  optTip?: string;
  gamma?: string;
  epsilon?: string;
}

interface IChangeAiInfo {
  attackRobot?: IRobootData
  proliferationRobot?: IRobootData;
  targetTrainNumber?: string;
}

export default function AiConfigUi(props: IProps & IUseGameStatus) {
  const aiInfo = props?.gameInfo?.aiInfo;
  const changeAiInfo = (info: IChangeAiInfo) => {
    props.setAiInfo?.(deepMerge(aiInfo, info))
  }
  const stepTrain = (e: Event) => {
    e.stopPropagation();
    props.stepTrain?.();
  }

  return (
    <div className={`${styles.container} ${props.show ? styles.showContainer : styles.hiddenContainer}`}>
      <div className={styles.grid}>
        {/* 控制面板 */}
        <div className={styles.card}>
          <h2 className={styles.heading}>
            <i className="fa fa-sliders mr-2 text-primary"></i>
            控制面板
          </h2>
          <div className={styles.edUI}>
            {/* attackRobot */}
            <p className={styles.sectionTitle}>attackRobot</p>
            <div>
              <label className={styles.label}>{aiInfo?.attackRobot?.optTip}</label>
            </div>
            <div className={styles.sliderGroup}>
              <label className={styles.label}>折扣因子 (γ)</label>
              <input
                type="range"
                id="discountFactor"
                min="0.1"
                max="1"
                step="0.1"
                value={aiInfo?.attackRobot?.gamma}
                onInput={e => changeAiInfo({ attackRobot: { gamma: e.currentTarget?.value || '' } })}
                className={styles.slider}
              />
              <span className={styles.sliderValue}>{aiInfo?.attackRobot?.gamma}</span>
            </div>
            <div className={styles.sliderGroup}>
              <label className={styles.label}>探索率 (ε)</label>
              <input
                type="range"
                id="epsilon"
                min="0.1"
                max="1"
                step="0.1"
                value={aiInfo?.attackRobot?.epsilon}
                onChange={e => changeAiInfo({ attackRobot: { epsilon: e.currentTarget?.value } })}
                className={styles.slider}
              />
              <span className={styles.sliderValue}>{aiInfo?.attackRobot?.epsilon}</span>
            </div>

            {/* proliferationRobot */}
            <p className={styles.sectionTitle}>proliferationRobot</p>
            <div>
              <label className={styles.label}>{aiInfo?.proliferationRobot?.optTip}</label>
            </div>
            <div className={styles.sliderGroup}>
              <label className={styles.label}>{`折扣因子(Y)`}</label>
              <input
                type="range"
                id="discountFactor"
                min="0.1"
                max="1"
                step="0.1"
                value={aiInfo?.proliferationRobot?.gamma}
                onChange={e => changeAiInfo({ proliferationRobot: { gamma: e.currentTarget.value } })}
                className={styles.slider}
              />
              <span className={styles.sliderValue}>{aiInfo?.proliferationRobot?.gamma}</span>
            </div>
            <div className={styles.sliderGroup}>
              <label className={styles.label}>探索率 (ε)</label>
              <input
                type="range"
                id="epsilon"
                min="0.1"
                max="1"
                step="0.1"
                value={aiInfo?.proliferationRobot?.epsilon}
                onChange={e => changeAiInfo({ proliferationRobot: { epsilon: e.currentTarget.value } })}
                className={styles.slider}
              />
              <span className={styles.sliderValue}>{aiInfo?.proliferationRobot?.epsilon}</span>
            </div>

            {/* 训练设置 */}
            <p className={styles.sectionDivider}></p>
            <div className={styles.edStart}>
              <label className={styles.edStartLine}>训练设置</label>
              <div className={styles.inputGroup}>
                <input
                  type="number"
                  id="episodes"
                  value={aiInfo?.targetTrainNumber || ''}
                  min="1"
                  max="10000"
                  onChange={e => changeAiInfo({ targetTrainNumber: e.currentTarget.value })}
                  className={styles.input}
                />
                <span className={styles.span}>回合</span>
              </div>
            </div>
            <div className={styles.currentEpisode}>
              当前第： {aiInfo?.currentTrainNumber} 回合
            </div>
            <div className={styles.buttonGroup}>
              <button
                id="trainBtn"
                className={styles.btnPrimary}
                onClick={props.startTrain}
              >
                <i className="fa fa-play mr-2"></i>
                开始训练
              </button>
              <button
                id="trainBtn"
                className={styles.btnPrimary}
                onClick={props.paushTrain}
              >
                <i className="fa fa-play mr-2"></i>
                暂停训练
              </button>
            </div>
          </div>
        </div>

        {/* 网格世界和Q表 */}
        <div className={styles.statistics}>
          <div className={styles.card}>
            <h2 className={styles.heading}>训练统计</h2>
            <p className={styles.sectionTitle}>attackRobot</p>
            <div className={styles.gridStats}>
              <div className={styles.chartWrapper}>
                <h3 className={styles.chartTitle}>累积奖励</h3>
                <div id="rewardChart" className={styles.chart}>{aiInfo?.attackRobot?.accumulatedRewards}</div>
              </div>
              <div className={styles.chartWrapper}>
                <h3 className={styles.chartTitle}>累积惩罚</h3>
                <div id="rewardChart" className={styles.chart}>{aiInfo?.attackRobot?.accumulatedPunishment}</div>
              </div>
            </div>

            <p className={styles.sectionTitle}>proliferationRobot</p>
            <div className={styles.gridStats}>
              <div className={styles.chartWrapper}>
                <h3 className={styles.chartTitle}>累积奖励</h3>
                <div id="rewardChart" className={styles.chart}>{aiInfo?.proliferationRobot?.accumulatedRewards}</div>
              </div>
              <div className={styles.chartWrapper}>
                <h3 className={styles.chartTitle}>累积惩罚</h3>
                <div id="rewardChart" className={styles.chart}>{aiInfo?.proliferationRobot?.accumulatedPunishment}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>DQN 算法可视化</p>
      </footer>
    </div>
  );
}