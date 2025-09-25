// JWT认证中间件
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

// 从环境变量或配置文件获取JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key'; // 实际使用时应设置为强密钥
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// 用户数据文件路径
const userDataFile = path.join(process.cwd(), 'data', 'user_data.json');
const phoneDataFile = path.join(process.cwd(), 'data', 'phone_data.json');

class AuthMiddleware {
  constructor() {
    this.jwtSecret = JWT_SECRET;
    this.jwtExpiresIn = JWT_EXPIRES_IN;
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
   * 验证手机号和验证码（简化版）
   * @param {string} phoneNumber - 手机号
   * @param {string} verificationCode - 验证码
   * @returns {Promise<boolean>} 验证结果
   */
  async verifyPhoneAndCode(phoneNumber, verificationCode) {
    try {
      // 实际项目中应该从数据库或缓存中获取验证码
      // 这里仅作示例，实际使用时需要实现真实的验证码验证逻辑
      // 注：在真实场景中，验证码应该是加密存储的，并有过期时间
      
      // 简单的验证逻辑（实际应更复杂）
      if (!phoneNumber || !verificationCode) {
        return false;
      }

      // 模拟验证码验证，实际应用中应从数据库或缓存中获取
      return verificationCode === '123456'; // 仅作示例，实际应用中应使用真实的验证码验证
    } catch (error) {
      console.error('验证码验证失败:', error);
      return false;
    }
  }
}

module.exports = new AuthMiddleware();