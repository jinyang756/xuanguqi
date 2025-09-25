// 请求日志中间件
// 用于记录API请求和响应信息
const fs = require('fs').promises;
const path = require('path');
const { format } = require('date-fns');

class LoggerMiddleware {
  constructor() {
    // 日志目录路径
    this.logDir = path.join(process.cwd(), 'logs');
    // 日志文件路径
    this.logFilePath = path.join(this.logDir, `${format(new Date(), 'yyyy-MM-dd')}.log`);
    // 确保日志目录存在
    this.ensureLogDirExists();
  }

  /**
   * 确保日志目录存在
   */
  async ensureLogDirExists() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      console.error('创建日志目录失败:', error);
    }
  }

  /**
   * 格式化日志消息
   * @param {string} level - 日志级别
   * @param {string} message - 日志消息
   * @param {Object} meta - 附加信息
   * @returns {string} 格式化后的日志
   */
  formatLog(level, message, meta = {}) {
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS');
    const metaStr = Object.keys(meta).length > 0 
      ? ` ${JSON.stringify(meta)}` 
      : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  /**
   * 写入日志到文件
   * @param {string} log - 日志内容
   */
  async writeToFile(log) {
    try {
      // 更新日志文件路径（按天分割）
      const todayFilePath = path.join(this.logDir, `${format(new Date(), 'yyyy-MM-dd')}.log`);
      if (this.logFilePath !== todayFilePath) {
        this.logFilePath = todayFilePath;
      }
      
      await fs.appendFile(this.logFilePath, log + '\n', 'utf8');
    } catch (error) {
      console.error('写入日志文件失败:', error);
    }
  }

  /**
   * 日志中间件
   */
  logger() {
    return async (req, res, next) => {
      const start = Date.now();
      
      // 保留原始的end方法
      const originalEnd = res.end;
      
      // 记录请求信息
      const requestInfo = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
        ip: req.ip || req.connection.remoteAddress
      };
      
      // 简化请求日志，避免敏感信息
      const simplifiedRequestInfo = {
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      };
      
      // 生成请求日志
      const requestLog = this.formatLog('info', '接收到请求', simplifiedRequestInfo);
      console.log(requestLog);
      
      // 异步写入日志文件
      this.writeToFile(requestLog);
      
      // 重写res.end方法来捕获响应信息
      const logger = this;
      res.end = function(chunk, encoding) {
        // 计算响应时间
        const duration = Date.now() - start;
        
        // 记录响应信息
        const responseInfo = {
          statusCode: this.statusCode,
          duration: `${duration}ms`,
          contentLength: this.getHeader('content-length') || 'unknown'
        };
        
        // 生成响应日志
        const responseLog = logger.formatLog('info', '请求处理完成', responseInfo);
        console.log(responseLog);
        
        // 异步写入日志文件
        logger.writeToFile(responseLog);
        
        // 调用原始的end方法
        originalEnd.call(this, chunk, encoding);
      };
      
      // 继续处理请求
      next();
    };
  }

  /**
   * 记录错误日志
   * @param {Error} error - 错误对象
   * @param {Object} meta - 附加信息
   */
  async error(error, meta = {}) {
    const errorLog = this.formatLog('error', error.message, {
      ...meta,
      stack: error.stack
    });
    console.error(errorLog);
    await this.writeToFile(errorLog);
  }

  /**
   * 记录警告日志
   * @param {string} message - 警告消息
   * @param {Object} meta - 附加信息
   */
  async warn(message, meta = {}) {
    const warnLog = this.formatLog('warn', message, meta);
    console.warn(warnLog);
    await this.writeToFile(warnLog);
  }

  /**
   * 记录信息日志
   * @param {string} message - 信息消息
   * @param {Object} meta - 附加信息
   */
  async info(message, meta = {}) {
    const infoLog = this.formatLog('info', message, meta);
    console.info(infoLog);
    await this.writeToFile(infoLog);
  }

  /**
   * 记录调试日志
   * @param {string} message - 调试消息
   * @param {Object} meta - 附加信息
   */
  async debug(message, meta = {}) {
    if (process.env.NODE_ENV !== 'production') {
      const debugLog = this.formatLog('debug', message, meta);
      console.debug(debugLog);
    }
  }
}

module.exports = new LoggerMiddleware();