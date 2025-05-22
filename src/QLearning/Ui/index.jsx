import { useEffect } from "react"
import './index.css'
export default function ConfigUi(props) {
  // const [show, setShow] = props.show;
  useEffect(() => {

  }, []);
  return (<div className={`container mx-auto px-4 py-8 max-w-6xl ${props.show ? 'showContainer' : 'hiddenContainer'}`}>
    {/* <header className="mb-8 text-center">
      <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold text-gray-800 mb-2">Q-Learning 算法可视化</h1>
      <p className="text-gray-600 max-w-2xl mx-auto">探索强化学习的基础 - Q-Learning 算法如何学习最优路径</p>
    </header> */}
    <div className={`aiSetting`} onClick={props.onClick}>
      AI设置
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* <!-- 控制面板 --> */}
      <div className="card lg:col-span-1">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <i className="fa fa-sliders mr-2 text-primary"></i>控制面板
        </h2>

        <div className="edUI">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">学习率 (α)</label>
            <input type="range" id="learningRate" min="0.01" max="1" step="0.01" value="0.1"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
            <span id="learningRateValue" className="text-sm text-gray-600">0.1</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">折扣因子 (γ)</label>
            <input type="range" id="discountFactor" min="0.01" max="1" step="0.01" value="0.9"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
            <span id="discountFactorValue" className="text-sm text-gray-600">0.9</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">探索率 (ε)</label>
            <input type="range" id="epsilon" min="0" max="1" step="0.01" value="1"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
            <span id="epsilonValue" className="text-sm text-gray-600">1.0</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">探索衰减率</label>
            <input type="range" id="epsilonDecay" min="0.9" max="0.999" step="0.001" value="0.995"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
            <span id="epsilonDecayValue" className="text-sm text-gray-600">0.995</span>
          </div>

          <div className="edStart">
            <label className="edStartLine">训练设置</label>
            <div className="flex items-center space-x-2">
              <input type="number" id="episodes" value="100" min="1" max="10000"
                className="w-20 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <span className="text-sm text-gray-600">回合</span>
            </div>
          </div>

          <div className="pt-2 flex space-x-3">
            <button id="trainBtn" className="btn-primary flex-1 flex items-center justify-center">
              <i className="fa fa-play mr-2"></i>
              开始训练
            </button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-3">训练状态</h3>
          <div className="aiStatus ">
            <div>
              <p className="text-sm text-gray-500">当前回合</p>
              <p id="currentEpisode" className="text-xl font-semibold text-gray-800">0</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">当前奖励</p>
              <p id="currentReward" className="text-xl font-semibold text-gray-800">0</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">总步数</p>
              <p id="totalSteps" className="text-xl font-semibold text-gray-800">0</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">探索率</p>
              <p id="currentEpsilon" className="text-xl font-semibold text-gray-800">1.00</p>
            </div>
          </div>
        </div>
      </div>

      {/* <!-- 网格世界和Q表 --> */}
      <div className="lg:col-span-2 space-y-8">

        {/* <!-- 训练统计 --> */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            训练统计
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">累积奖励</h3>
              <div id="rewardChart" className="w-full h-64"></div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">每回合步数</h3>
              <div id="stepsChart" className="w-full h-64"></div>
            </div>
          </div>
        </div>

        {/* <!-- Q表可视化 --> */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <i className="fa fa-table mr-2 text-primary"></i>Q表可视化
          </h2>
          <div id="qTableContainer" className="overflow-x-auto"></div>
        </div>
      </div>
    </div>

    <footer className="mt-12 text-center text-gray-500 text-sm">
      <p>Q-Learning 算法可视化演示 | 强化学习基础</p>
    </footer>
  </div>)
}