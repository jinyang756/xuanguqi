// 用于读取存储在JSON文件中的用户数据

const userDataStorage = require('./user_data_storage');
const fs = require('fs').promises;
const path = require('path');

module.exports = async (req, res) => {
  try {
    // 设置允许跨域请求
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 如果是OPTIONS请求，直接返回200
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // 初始化数据存储
    await userDataStorage.init();
    
    // 读取用户数据文件
    const userDataPath = path.join(process.cwd(), 'data', 'user_data.json');
    
    try {
      // 尝试直接读取文件获取所有用户数据
      const userData = JSON.parse(await fs.readFile(userDataPath, 'utf8'));
      res.status(200).json({
        success: true,
        data: userData
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        // 如果文件不存在，返回空对象
        res.status(200).json({
          success: true,
          data: {}
        });
      } else {
        throw error;
      }
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