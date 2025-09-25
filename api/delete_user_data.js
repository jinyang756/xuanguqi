// 用于删除特定的用户记录

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
    
    // 确保是POST请求
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        message: '只允许POST请求'
      });
    }
    
    // 解析请求体
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const requestData = JSON.parse(body);
        const phoneNumber = requestData.phoneNumber; // 使用手机号作为唯一标识符
        
        if (!phoneNumber) {
          return res.status(400).json({
            success: false,
            message: '缺少手机号参数'
          });
        }
        
        // 读取用户数据文件
        const userDataPath = path.join(process.cwd(), 'data', 'user_data.json');
        
        if (fs.existsSync(userDataPath)) {
          const userData = JSON.parse(fs.readFileSync(userDataPath, 'utf8'));
          
          // 过滤掉要删除的用户
          const newUserData = userData.filter(user => user.phone_number !== phoneNumber);
          
          // 写回文件
          fs.writeFileSync(userDataPath, JSON.stringify(newUserData, null, 2), 'utf8');
          
          res.status(200).json({
            success: true,
            message: '用户记录删除成功',
            deletedCount: userData.length - newUserData.length
          });
        } else {
          res.status(404).json({
            success: false,
            message: '用户数据文件不存在'
          });
        }
      } catch (error) {
        console.error('解析请求体失败:', error);
        res.status(400).json({
          success: false,
          message: '请求体格式错误'
        });
      }
    });
  } catch (error) {
    console.error('删除用户数据失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};