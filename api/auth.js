// JWT认证中间件
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

// 从环境变量获取JWT密钥，不再提供默认值以提高安全性
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// 验证码存储（实际项目中应使用Redis或其他缓存机制）
const verificationCodes = new Map(); // 存储验证码信息: { code, expireTime }
const CODE_EXPIRY_MINUTES = 5; // 验证码有效期（分钟）

// 用户数据文件路径
const userDataFile = path.join(process.cwd(), 'data', 'user_data.json');
const phoneDataFile = path.join(process.cwd(), 'data', 'phone_data.json');

class AuthMiddleware {
  constructor() {
    // 确保JWT密钥已配置
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set. This is required for authentication.');
    }
    this.jwtSecret = JWT_SECRET;
    this.jwtExpiresIn = JWT_EXPIRES_IN;
    this.verificationCodes = verificationCodes;
  }

  /**
   * 生成JWT令牌
   * @param {Object} userData - 用户数据
   * @returns {string} JWT令牌
   */
  generateToken(userData) {
    return jwt.sign(userData, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
  }

  /**
   * 验证JWT令牌
   * @param {string} token - JWT令牌
   * @returns {Object|null} 解码后的用户数据，或null（如果验证失败）
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      console.error('JWT验证失败:', error.message);
      return null;
    }
  }

  /**
   * 认证中间件
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  authenticate(req, res, next) {
    try {
      // 从请求头获取Authorization
      const authHeader = req.headers.authorization;
      
      // 如果没有Authorization头，直接调用next（用于公开API）
      if (!authHeader) {
        req.user = null;
        return next();
      }

      // 提取令牌
      const token = authHeader.replace('Bearer ', '');
      
      // 验证令牌
      const decoded = this.verifyToken(token);
      
      if (decoded) {
        req.user = decoded;
      }
      
      next();
    } catch (error) {
      console.error('认证中间件错误:', error);
      req.user = null;
      next();
    }
  }

  /**
   * 权限验证中间件
   * @param {Array} requiredPermissions - 需要的权限列表
   */
  authorize(requiredPermissions = []) {
    return (req, res, next) => {
      // 如果没有用户，拒绝访问
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '未授权访问，请先登录'
        });
      }

      // 如果用户是超级管理员，直接通过
      const appConfig = require('../config.js').appConfig;
      if (appConfig.superAdmin.phoneNumbers.includes(req.user.phoneNumber)) {
        return next();
      }

      // 如果需要特定权限，检查用户权限
      if (requiredPermissions.length > 0) {
        const userPermissions = req.user.permissions || [];
        const hasPermission = requiredPermissions.some(permission => 
          userPermissions.includes(permission)
        );
        
        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            message: '权限不足，无法访问此资源'
          });
        }
      }

      next();
    };
  }

  /**
   * 生成验证码
   * @returns {string} 6位数字验证码
   */
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 保存验证码
   * @param {string} phoneNumber - 手机号
   * @returns {string} 生成的验证码
   */
  saveVerificationCode(phoneNumber) {
    const code = this.generateVerificationCode();
    const expireTime = Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000;
    
    this.verificationCodes.set(phoneNumber, {
      code,
      expireTime,
      createdAt: new Date().toISOString()
    });
    
    // 记录日志但不包含验证码
    console.log(`验证码已生成并保存，手机号: ${phoneNumber}, 有效期: ${CODE_EXPIRY_MINUTES}分钟`);
    
    return code;
  }

  /**
   * 验证手机号和验证码
   * @param {string} phoneNumber - 手机号
   * @param {string} verificationCode - 验证码
   * @returns {Promise<boolean>} 验证结果
   */
  async verifyPhoneAndCode(phoneNumber, verificationCode) {
    try {
      // 参数验证
      if (!phoneNumber || !verificationCode || typeof phoneNumber !== 'string' || typeof verificationCode !== 'string') {
        return false;
      }

      // 获取存储的验证码信息
      const codeInfo = this.verificationCodes.get(phoneNumber);
      
      if (!codeInfo) {
        console.log(`未找到手机号 ${phoneNumber} 的验证码`);
        return false;
      }

      // 检查验证码是否过期
      const now = Date.now();
      if (now > codeInfo.expireTime) {
        console.log(`手机号 ${phoneNumber} 的验证码已过期`);
        // 移除过期的验证码
        this.verificationCodes.delete(phoneNumber);
        return false;
      }

      // 验证验证码是否匹配
      const isMatch = codeInfo.code === verificationCode;
      
      // 无论验证成功与否，都删除验证码（防止重复使用）
      this.verificationCodes.delete(phoneNumber);
      
      if (isMatch) {
        console.log(`手机号 ${phoneNumber} 验证成功`);
      } else {
        console.log(`手机号 ${phoneNumber} 验证码不匹配`);
      }
      
      return isMatch;
    } catch (error) {
      console.error('验证码验证失败:', error);
      return false;
    }
  }
}

module.exports = new AuthMiddleware();