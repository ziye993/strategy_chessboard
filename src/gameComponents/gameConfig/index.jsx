import React, { useState } from 'react';

const GameConfig = () => {
  const [config, setConfig] = useState({
    blockInterval: 0.002,
    blockSize: 50,
    randomEmpty: 0.1,
    blockDefaultSize: 50,
    blockIntervalSeed: 0.7,
    currentBlockInterval: 0.002,
    divisionContent: 0,
    mapHeightSize: 1500,
    mapWidthSize: 1500,
    coverArea: 0.8,
    lineColor: [255, 255, 255, 1]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prevConfig) => ({
      ...prevConfig,
      [name]: name.includes('Color') ? value.split(',').map(Number) : parseFloat(value)
    }));
  };

  return (
    <div style={{ width: 300, height: 150, border: '1px solid #ccc', padding: 10, overflowY: 'auto' }}>
      {Object.entries(config).map(([key, value]) => (
        <div key={key} style={{ marginBottom: 5 }}>
          <label htmlFor={key}>{key}: </label>
          {key.includes('Color') ? (
            <input
              type="text"
              id={key}
              name={key}
              value={value.toString()}
              onChange={handleChange}
              style={{ width: 100, marginLeft: 10 }}
            />
          ) : (
            <input
              type="range"
              id={key}
              name={key}
              min={0}
              max={key.includes('Interval') || key.includes('randomEmpty') || key.includes('coverArea') ? 1 : 2000}
              step={key.includes('Interval') || key.includes('randomEmpty') || key.includes('coverArea') ? 0.001 : 1}
              value={value}
              onChange={handleChange}
              style={{ width: 150, marginLeft: 10 }}
            />
          )}
          <span style={{ marginLeft: 10 }}>{value}</span>
        </div>
      ))}
    </div>
  );
};

export default GameConfig;    