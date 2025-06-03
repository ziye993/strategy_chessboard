import { useEffect, useState } from "react"
import './index.css'
import { deepMerge } from "../../tool/utils";
export default function ConfigUi(props) {
  const aiInfo = props?.gameInfo?.aiInfo || {};
  const changeAiInfo = (info) => {
    props.setAiInfo(deepMerge(aiInfo, info))
  }
  const stepTrain = (e) => {
    e.stopPropagation();
    props.stepTrain();
  }
  return (<div className={`container mx-auto px-4 py-8 max-w-6xl ${props.show ? 'showContainer' : 'hiddenContainer'}`}>
    {/* <header className="mb-8 text-center">
      <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold text-gray-800 mb-2">Q-Learning 算法可视化</h1>
      <p className="text-gray-600 max-w-2xl mx-auto">探索强化学习的基础 - Q-Learning 算法如何学习最优路径</p>
    </header> */}
    {/* <div className={`aiSetting`} onClick={props.onClick}>
      AI设置
      <div className="fastAiSetting" onClick={stepTrain}>
        训练一步
      </div>
    </div> */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* <!-- 控制面板 --> */}
      <div className="card lg:col-span-1">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <i className="fa fa-sliders mr-2 text-primary"></i>控制面板
        </h2>

        <div className="edUI">

          {/* attackRobot */}
          <p style={{ borderBottom: '1px solid #111' }}>attackRobot</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{aiInfo?.attackRobot?.optTip}</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">折扣因子 (γ)</label>
            <input
              type="range"
              id="discountFactor"
              min="0.1"
              max="1"
              step="0.1"
              value={aiInfo?.attackRobot?.gamma}
              onInput={e => changeAiInfo({ attackRobot: { gamma: e.target.value } })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <span id="discountFactorValue" className="text-sm text-gray-600">{aiInfo?.attackRobot?.gamma}</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">探索率 (ε)</label>
            <input type="range" id="epsilon" min="0.1" max="1" step="0.1" value={aiInfo?.attackRobot?.epsilon}
              onChange={e => changeAiInfo({ attackRobot: { epsilon: e.target.value } })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
            <span id="epsilonValue" className="text-sm text-gray-600">{aiInfo?.attackRobot?.epsilon}</span>
          </div>

          {/* proliferationRobot */}
          <p style={{ borderBottom: '1px solid #111' }}>proliferationRobot</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{aiInfo?.proliferationRobot?.optTip}</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">折扣因子 (γ)</label>
            <input type="range" id="discountFactor" min="0.1" max="1" step="0.1"
              value={aiInfo?.proliferationRobot?.gamma}
              onChange={e => changeAiInfo({ proliferationRobot: { gamma: e.target.value } })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
            <span id="discountFactorValue" className="text-sm text-gray-600">{aiInfo?.proliferationRobot?.gamma}</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">探索率 (ε)</label>
            <input type="range" id="epsilon" min="0.1" max="1" step="0.1" value={aiInfo?.proliferationRobot?.epsilon}
              onChange={e => changeAiInfo({ proliferationRobot: { epsilon: e.target.value } })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
            <span id="epsilonValue" className="text-sm text-gray-600">{aiInfo?.proliferationRobot?.epsilon}</span>
          </div>

          {/* 训练设置 */}
          <p style={{ borderBottom: '1px solid #111' }}></p>
          <div className="edStart">
            <label className="edStartLine">训练设置</label>
            <div className="flex items-center space-x-2">
              <input type="number" id="episodes" value={aiInfo?.targetTrainNumber || ''} min="1" max="10000"
                onChange={e => changeAiInfo({ targetTrainNumber: e.target.value })}
                className="w-20 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <span className="text-sm text-gray-600">回合</span>
            </div>

          </div>
          <div className="edStart">
            当前第： {aiInfo?.currentTrainNumber} 回合
          </div>
          <div className="pt-2 flex space-x-3">
            <button id="trainBtn" className="btn-primary flex-1 flex items-center justify-center" onClick={props.startTrain}>
              <i className="fa fa-play mr-2"></i>
              开始训练
            </button>
            <button id="trainBtn" className="btn-primary flex-1 flex items-center justify-center" onClick={props.paushTrain}>
              <i className="fa fa-play mr-2"></i>
              暂停训练
            </button>
          </div>
        </div>

        {/* <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-3">训练状态</h3>
          <p style={{ borderBottom: '1px solid #111' }}>attackRobot</p>
          <div className="aiStatus ">
            <div>
              <span className="text-sm text-gray-500">当前回合</span>
              <span id="currentEpisode" className="text-xl font-semibold text-gray-800">0</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">当前奖励</span>
              <span id="currentReward" className="text-xl font-semibold text-gray-800">0</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">总步数</span>
              <span id="totalSteps" className="text-xl font-semibold text-gray-800">0</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">探索率</span>
              <span id="currentEpsilon" className="text-xl font-semibold text-gray-800">1.00</span>
            </div>
          </div>
          <p style={{ borderBottom: '1px solid #111' }}>proliferationRobot</p>
          <div className="aiStatus ">
            <div>
              <span className="text-sm text-gray-500">当前回合</span>
              <span id="currentEpisode" className="text-xl font-semibold text-gray-800">0</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">当前奖励</span>
              <span id="currentReward" className="text-xl font-semibold text-gray-800">0</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">总步数</span>
              <span id="totalSteps" className="text-xl font-semibold text-gray-800">0</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">探索率</span>
              <span id="currentEpsilon" className="text-xl font-semibold text-gray-800">1.00</span>
            </div>
          </div>
        </div> */}
      </div>

      {/* <!-- 网格世界和Q表 --> */}
      <div className="lg:col-span-2 space-y-8">

        {/* <!-- 训练统计 --> */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            训练统计
          </h2>
          <p style={{ borderBottom: '1px solid #111' }}>attackRobot</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">累积奖励</h3>
              <div id="rewardChart" className="w-full h-64">{aiInfo?.attackRobot?.accumulatedRewards}</div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">累积惩罚</h3>
              <div id="rewardChart" className="w-full h-64">{aiInfo?.attackRobot?.accumulatedPunishment}</div>
            </div>
            {/* <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">每回合步数</h3>
              <div id="stepsChart" className="w-full h-64"></div>
            </div> */}
          </div>

          <p style={{ borderBottom: '1px solid #111' }}>proliferationRobot</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">累积奖励</h3>
              <div id="rewardChart" className="w-full h-64">{aiInfo?.proliferationRobot?.accumulatedRewards}</div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">累积惩罚</h3>
              <div id="rewardChart" className="w-full h-64">{aiInfo?.proliferationRobot?.accumulatedPunishment}</div>
            </div>
            {/* <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">每回合步数</h3>
              <div id="stepsChart" className="w-full h-64"></div>
            </div> */}
          </div>
        </div>

        {/* <!-- Q表可视化 --> */}
        {/* <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <i className="fa fa-table mr-2 text-primary"></i>Q表可视化
          </h2>
          <div id="qTableContainer" className="overflow-x-auto"></div>
        </div> */}
      </div>
    </div>

    <footer className="mt-12 text-center text-gray-500 text-sm">
      <p>DQN 算法可视化</p>
    </footer>
  </div>)
}