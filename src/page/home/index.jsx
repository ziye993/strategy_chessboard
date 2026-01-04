import React, { useEffect, useRef, useState } from 'react';
import styles from './index.module.css';

const stylesFormat = (str) => {
  const strArr = str.split(' ').map(_ => styles[_]).join(' ')
  return strArr
}

const Button = (props) => <button className={stylesFormat("btn online-btn")} onClick={props.onClick}>
  <i className={stylesFormat("fa fa-cloud")} /> {props.children}
</button>


const Step = (props) => {
  const { currentStep, stepKey } = props;
  return <div className={stylesFormat("button-container")} style={{ position: 'absolute', opacity: currentStep === stepKey ? '1' : '0', zIndex: currentStep === stepKey ? '998' : '0' }}>
    {props.children}
  </div>
}

function Home(props) {
  const [mapSize, setMapSize] = useState(8);
  const [currentStep, setCurrentStep] = useState(0);
  const gameconfig = useRef({});
  const create = () => props?.create?.({ ...gameconfig.current, mapSize: gameconfig.current.mapSize || mapSize });

  useEffect(() => {
    gameconfig.current.mapSize = null
  }, [mapSize])

  return (<div className={stylesFormat("app-container")} style={{ opacity: props.gameType ? '0' : '1', zIndex: props.gameType ? '0' : '999' }}>
    <Step currentStep={currentStep} stepKey={0} >
      <Button onClick={() => { setCurrentStep(1); gameconfig.current.gametype = 'line' }}>在线</Button>
      <Button onClick={() => { setCurrentStep(1); gameconfig.current.gametype = 'local' }}>本地</Button>
      <Button onClick={() => window.close()}>退出</Button>
    </Step>
    <Step currentStep={currentStep} stepKey={1}>
      <Button onClick={() => setCurrentStep(0)}>上一步</Button>
      <Button onClick={() => { gameconfig.current.mapSize = 8; create() }}>小[8X8]</Button>
      <Button onClick={() => { gameconfig.current.mapSize = 14; create() }}>中[14X14]</Button>
      <Button onClick={() => { gameconfig.current.mapSize = 20; create() }}>大[20X20]</Button>
      <Button onClick={() => setCurrentStep(2)}>自定义</Button>
    </Step>
    <Step currentStep={currentStep} stepKey={2}>
      <Button onClick={() => setCurrentStep(1)}>上一步</Button>
      <Button onClick={() => setMapSize(prev => prev < 9 ? prev : (prev - 1))} ><i className="bi bi-dash-lg" /></Button>
      <Button> {mapSize}</Button>
      <Button onClick={() => setMapSize(prev => prev > 19 ? prev : (prev + 1))} ><i className="bi bi-plus-lg" /></Button>
      <Button onClick={create}>创建</Button>
    </Step>
  </div >);
}

export default Home;
