// 保存用户数据和手机号的API
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
    
    // 验证请求数据
    const { name, phone, userId } = requestData;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '缺少用户ID'
      });
    }
    
    // 验证数据完整性
    const validationResult = userDataStorage.validateUserData({
      name,
      phone
    });
    
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors: validationResult.errors
      });
    }
    
    // 保存用户数据
    const userData = {
      name: name || '',
      phone: phone || '',
      createdAt: new Date().toISOString()
    };
    
    const saveResult = await userDataStorage.saveUserData(userId, userData);
    
    if (!saveResult) {
      return res.status(500).json({
        success: false,
        message: '保存用户数据失败'
      });
    }
    
    // 如果提供了手机号，单独保存手机号数据
    if (phone) {
      const savePhoneResult = await userDataStorage.savePhoneData(userId, phone);
      
      if (!savePhoneResult) {
        console.warn('保存手机号数据失败，但用户数据已保存');
      }
    }
    
    // 返回成功响应
    res.status(200).json({
      success: true,
      message: '用户数据保存成功',
      data: userData
    });
    
  } catch (error) {
    console.error('保存用户数据过程中发生错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};