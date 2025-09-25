// 主服务器文件
// 整合认证中间件和日志中间件，提供统一的API服务入口
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// 导入中间件
const authMiddleware = require('./api/auth.js');
const loggerMiddleware = require('./middleware/logger.js');
const appConfig = require('./config.js');

const app = express();
const PORT = process.env.PORT || 3000;

// 全局中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'src')));
app.use('/fonts', express.static(path.join(__dirname, 'fonts')));

// 使用日志中间件
app.use(loggerMiddleware.logger());

// 使用认证中间件
app.use(authMiddleware.authenticate);

/**
 * 执行Python脚本
 * @param {string} scriptPath - Python脚本路径
 * @param {Array} args - 命令行参数
 * @returns {Object} 执行结果
 */
function executePythonScript(scriptPath, args = []) {
  try {
    // 构建命令行参数
    const commandArgs = [scriptPath, ...args].join(' ');
    const pythonCommand = `python ${commandArgs}`;
    
    loggerMiddleware.debug(`执行Python脚本: ${pythonCommand}`);
    
    // 执行Python脚本
    const result = execSync(pythonCommand, {
      encoding: 'utf-8',
      timeout: 30000 // 30秒超时
    });
    
    // 尝试解析JSON结果
    try {
      return JSON.parse(result);
    } catch (parseError) {
      return { success: false, message: 'Python脚本返回非JSON格式结果', data: result };
    }
  } catch (error) {
    loggerMiddleware.error(error, { scriptPath, args });
    return { success: false, message: `Python脚本执行失败: ${error.message}` };
  }
}

// API路由

// 登录接口 - 获取验证码（简化版）
app.post('/api/login/send-code', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber || typeof phoneNumber !== 'string' || !/^1\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ success: false, message: '请提供有效的手机号码' });
    }
    
    // 模拟发送验证码（实际应用中应该调用短信服务）
    loggerMiddleware.info('发送验证码', { phoneNumber });
    
    // 检查是否为超级管理员
    const isSuperAdmin = appConfig.superAdmin.phoneNumbers.includes(phoneNumber);
    
    res.json({
      success: true,
      message: '验证码已发送',
      isSuperAdmin
    });
  } catch (error) {
    loggerMiddleware.error(error);
    res.status(500).json({ success: false, message: '发送验证码失败' });
  }
});

// 登录接口 - 验证验证码并获取令牌
app.post('/api/login/verify-code', async (req, res) => {
  try {
    const { phoneNumber, verificationCode } = req.body;
    
    if (!phoneNumber || !verificationCode) {
      return res.status(400).json({ success: false, message: '请提供手机号和验证码' });
    }
    
    // 验证验证码（简化版）
    const isValid = await authMiddleware.verifyPhoneAndCode(phoneNumber, verificationCode);
    
    if (!isValid) {
      return res.status(401).json({ success: false, message: '验证码错误或已过期' });
    }
    
    // 检查是否为超级管理员
    const isSuperAdmin = appConfig.superAdmin.phoneNumbers.includes(phoneNumber);
    
    // 生成JWT令牌
    const token = authMiddleware.generateToken({
      phoneNumber,
      isSuperAdmin,
      permissions: isSuperAdmin ? ['all'] : ['basic']
    });
    
    loggerMiddleware.info('用户登录成功', { phoneNumber, isSuperAdmin });
    
    res.json({
      success: true,
      message: '登录成功',
      token,
      userInfo: {
        phoneNumber,
        isSuperAdmin
      }
    });
  } catch (error) {
    loggerMiddleware.error(error);
    res.status(500).json({ success: false, message: '登录失败' });
  }
});

// 选股API - 支持模拟数据和Python脚本
app.post('/api/select-stocks', authMiddleware.authorize(['basic', 'all']), async (req, res) => {
  try {
    const { strategy = 'default', params = {} } = req.body;
    
    // 记录选股请求
    loggerMiddleware.info('选股请求', {
      strategy,
      params: Object.keys(params).length > 0 ? params : '默认参数',
      user: req.user?.phoneNumber || '未登录用户',
      useMockData: appConfig.dataSource.useMockData
    });
    
    let result;
    
    // 如果配置为使用模拟数据，则直接读取模拟数据文件
    if (appConfig.dataSource.useMockData) {
      try {
        // 读取策略索引文件
        const indexPath = path.join(__dirname, 'data', 'index.json');
        const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
        
        // 查找当前策略对应的数据源
        let strategyDataFile = appConfig.dataSource.mockDataFile; // 默认数据源
        const strategyConfig = indexData.strategies?.find(s => s.id === strategy);
        
        if (strategyConfig && strategyConfig.enabled) {
          strategyDataFile = path.join('data', strategyConfig.dataFile);
        }
        
        // 读取模拟数据文件
        const mockDataPath = path.join(__dirname, strategyDataFile);
        let mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf-8'));
        
        // 数据格式兼容处理
        if (mockData.stocks && Array.isArray(mockData.stocks)) {
          // 新格式：数据在stocks字段中
          mockData.data = mockData.stocks;
          mockData.total = mockData.stocks.length;
        }
        
        // 根据策略过滤模拟数据
        if (mockData.data && Array.isArray(mockData.data)) {
          mockData.data = mockData.data.filter(stock => 
            (!stock.strategies || stock.strategies.includes(strategy) || stock.strategies.includes('default')) ||
            (!stock.strategy || stock.strategy === strategy || stock.strategy === 'default')
          );
          mockData.total = mockData.data.length;
        }
        
        result = mockData;
        loggerMiddleware.info('使用模拟数据返回选股结果', { strategy, dataFile: strategyDataFile, resultCount: result.data?.length || 0 });
      } catch (mockError) {
        loggerMiddleware.error('读取模拟数据失败', { error: mockError.message });
        result = {
          success: false,
          message: '读取模拟数据失败',
          error: mockError.message
        };
      }
    } else {
      // 否则执行Python脚本
      try {
        const scriptPath = path.join(__dirname, 'api', 'select.py');
        result = executePythonScript(scriptPath, [
          '--strategy', strategy,
          '--params', JSON.stringify(params)
        ]);
        
        if (result.success) {
          loggerMiddleware.info('Python脚本选股成功', { strategy, resultCount: result.data?.length || 0 });
        } else {
          loggerMiddleware.warn('Python脚本选股失败', { strategy, reason: result.message });
        }
      } catch (pythonError) {
        loggerMiddleware.error('Python脚本执行失败', { error: pythonError.message });
        result = {
          success: false,
          message: 'Python脚本执行失败',
          error: pythonError.message
        };
      }
    }
    
    res.json(result);
  } catch (error) {
    loggerMiddleware.error(error);
    res.status(500).json({ success: false, message: '选股过程中发生错误' });
  }
});

// 获取用户数据
app.get('/api/user-data', authMiddleware.authorize(['basic', 'all']), async (req, res) => {
  try {
    if (!req.user?.phoneNumber) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    const phoneNumber = req.user.phoneNumber;
    const UserDataStorage = require('./api/user_data_storage.js');
    const userData = await UserDataStorage.getUserData(phoneNumber);
    
    loggerMiddleware.info('获取用户数据', { phoneNumber });
    
    res.json({
      success: true,
      message: '获取成功',
      data: userData
    });
  } catch (error) {
    loggerMiddleware.error(error);
    res.status(500).json({ success: false, message: '获取用户数据失败' });
  }
});

// 保存用户数据
app.post('/api/user-data', authMiddleware.authorize(['basic', 'all']), async (req, res) => {
  try {
    if (!req.user?.phoneNumber) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    const phoneNumber = req.user.phoneNumber;
    const userData = req.body;
    
    const UserDataStorage = require('./api/user_data_storage.js');
    await UserDataStorage.saveUserData(phoneNumber, userData);
    
    loggerMiddleware.info('保存用户数据', { phoneNumber });
    
    res.json({
      success: true,
      message: '保存成功'
    });
  } catch (error) {
    loggerMiddleware.error(error);
    res.status(500).json({ success: false, message: '保存用户数据失败' });
  }
});

// 获取应用配置
app.get('/api/config', async (req, res) => {
  try {
    // 返回不包含敏感信息的配置
    const publicConfig = {
      appName: 'A股量化选股器',
      version: '1.0.0',
      features: {
        strategies: ['default', 'breakout', 'volume', 'short-term-growth'],
        technicalIndicators: ['MA5', 'MA20', 'MA60', 'VOLUME_MA5', 'VOLUME_MA20']
      }
    };
    
    res.json({
      success: true,
      message: '获取成功',
      data: publicConfig
    });
  } catch (error) {
    loggerMiddleware.error(error);
    res.status(500).json({ success: false, message: '获取配置失败' });
  }
});

// 健康检查接口
app.get('/api/health', async (req, res) => {
  res.json({
    success: true,
    message: '服务运行正常',
    timestamp: new Date().toISOString()
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  loggerMiddleware.error(err, {
    method: req.method,
    url: req.url,
    user: req.user?.phoneNumber || 'unknown'
  });
  
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV !== 'production' ? err.message : undefined
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  });
});

// 启动服务器
app.listen(PORT, () => {
  const startupInfo = {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    useMockData: appConfig.dataSource.useMockData
  };
  
  loggerMiddleware.info('服务器已启动', startupInfo);
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`环境: ${startupInfo.environment}`);
  console.log(`是否使用模拟数据: ${startupInfo.useMockData}`);
});

module.exports = app;