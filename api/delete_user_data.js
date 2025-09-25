// 用于删除特定的用户记录

const userDataStorage = require('./user_data_storage');

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
    
    // 确保是POST请求
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        message: '只允许POST请求'
      });
    }
    
    // 解析请求体
    const requestData = await new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(new Error('请求体格式无效'));
        }
      });
    });
    
    // 获取要删除的用户ID或手机号
    const { userId, phoneNumber } = requestData;
    
    if (!userId && !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: '缺少用户ID或手机号参数'
      });
    }
    
    // 初始化数据存储
    await userDataStorage.init();
    
    // 如果提供了userId，直接使用userId删除
    if (userId) {
      const deleteResult = await userDataStorage.deleteUserData(userId);
      
      if (deleteResult) {
        return res.status(200).json({
          success: true,
          message: '用户数据删除成功'
        });
      } else {
        return res.status(404).json({
          success: false,
          message: '未找到该用户数据'
        });
      }
    } else if (phoneNumber) {
      const fs = require('fs').promises;
      const path = require('path');
      
      try {
        const userDataPath = path.join(process.cwd(), 'data', 'user_data.json');
        const userData = JSON.parse(await fs.readFile(userDataPath, 'utf8'));
        
        // 查找并删除匹配手机号的用户
        const userIdsToDelete = [];
        for (const [userId, user] of Object.entries(userData)) {
          if (user.phone === phoneNumber) {
            userIdsToDelete.push(userId);
          }
        }
        
        if (userIdsToDelete.length === 0) {
          return res.status(404).json({
            success: false,
            message: '未找到该手机号对应的用户数据'
          });
        }
        
        // 删除找到的用户
        for (const userId of userIdsToDelete) {
          delete userData[userId];
        }
        
        // 保存更新后的用户数据
        await fs.writeFile(userDataPath, JSON.stringify(userData, null, 2), 'utf8');
        
        // 返回成功响应
        res.status(200).json({
          success: true,
          message: '用户数据删除成功',
          deletedCount: userIdsToDelete.length
        });
      } catch (error) {
        if (error.code === 'ENOENT') {
          return res.status(404).json({
            success: false,
            message: '用户数据文件不存在'
          });
        }
        
        console.error('删除用户数据失败:', error);
        res.status(500).json({
          success: false,
          message: '服务器错误',
          error: error.message
        });
      }
    }
  } catch (error) {
    console.error('删除用户数据失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};