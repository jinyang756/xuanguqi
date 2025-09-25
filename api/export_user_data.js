// 用于导出CSV格式的用户数据

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
    
    if (fs.existsSync(userDataPath)) {
      const userData = JSON.parse(fs.readFileSync(userDataPath, 'utf8'));
      
      // 生成CSV内容
      const headers = ['姓名', '手机号', '提交时间'];
      const csvRows = [];
      
      // 添加表头
      csvRows.push(headers.join(','));
      
      // 添加数据行
      userData.forEach(user => {
        const row = [
          `"${user.name || ''}"`, // 用双引号包裹，防止包含逗号的情况
          user.phone_number || '',
          user.timestamp || ''
        ];
        csvRows.push(row.join(','));
      });
      
      // 合并所有行
      const csvContent = csvRows.join('\n');
      
      // 设置响应头，触发文件下载
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=user_data_${new Date().toISOString().split('T')[0]}.csv`);
      
      // 返回CSV内容
      res.status(200).send(csvContent);
    } else {
      res.status(404).json({
        success: false,
        message: '用户数据文件不存在'
      });
    }
  } catch (error) {
    console.error('导出用户数据失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};