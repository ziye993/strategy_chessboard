const express = require('express');
const fs = require('fs').promises;
const app = express();
const PORT = 3001;

// 解析JSON请求体
app.use(express.json());

// 处理POST请求
app.post('/api/saveJson', async (req, res) => {
  try {
    // 获取当前日期时间作为文件名
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const fileName = `data-${timestamp}.json`;
    
    // 写入JSON文件
    await fs.writeFile(fileName, JSON.stringify(req.body, null, 2));
    
    res.status(200).json({
      success: true,
      message: `JSON saved to ${fileName}`,
      file: fileName
    });
  } catch (error) {
    console.error('Error saving JSON:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save JSON',
      error: error.message
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});