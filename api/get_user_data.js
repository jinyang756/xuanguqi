// 用于读取存储在JSON文件中的用户数据

const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    // 设置允许跨域请求
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 如果是OPTIONS请求，直接返回200
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // 读取用户数据文件
    const userDataPath = path.join(process.cwd(), 'data', 'user_data.json');
    
    // 检查文件是否存在
    if (fs.existsSync(userDataPath)) {
      const userData = JSON.parse(fs.readFileSync(userDataPath, 'utf8'));
      res.status(200).json({
        success: true,
        data: userData
      });
    } else {
      // 如果文件不存在，返回空数组
      res.status(200).json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('读取用户数据失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};