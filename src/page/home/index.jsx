import React from 'react';
import styles from './index.module.css';

const stylesFormat = (str) => {
  const strArr = str.split(' ').map(_ => styles[_]).join(' ')
  return strArr
}

function Home(props) {
  return (
    <div className={stylesFormat("app-container")} style={{ opacity: props.gameType ? '0' : '1', zIndex: props.gameType ? '0' : '999' }}>
      <div className={stylesFormat("button-container")}>
        <button className={stylesFormat("btn online-btn")} onClick={() => props.onClick('line')}>
          <i className={stylesFormat("fa fa-cloud")} /> 在线
        </button>
        <button className={stylesFormat("btn local-btn")} onClick={() => props.onClick('local')}>
          <i className={stylesFormat("fa-desktop")} /> 本地
        </button>
        <button className={stylesFormat("btn exit-btn")} onClick={() => props.onClick('out')}>
          <i className={stylesFormat("fa-sign-out")} /> 退出
        </button>
      </div>
    </ div >
  );
}

export default Home;
