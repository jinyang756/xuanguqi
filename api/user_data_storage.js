// 用户数据存储管理功能
const fs = require('fs').promises;
const path = require('path');

class UserDataStorage {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.userDataFile = path.join(this.dataDir, 'user_data.json');
    this.phoneDataFile = path.join(this.dataDir, 'phone_data.json');
  }

  /**
   * 初始化数据目录和文件
   */
  async init() {
    try {
      // 创建数据目录
      try {
        await fs.mkdir(this.dataDir, { recursive: true });
      } catch (error) {
        if (error.code !== 'EEXIST') {
          console.error('创建数据目录失败:', error);
        }
      }

      // 初始化用户数据文件
      try {
        await fs.access(this.userDataFile);
      } catch (error) {
        if (error.code === 'ENOENT') {
          await fs.writeFile(this.userDataFile, JSON.stringify({}, null, 2), 'utf-8');
        }
      }

      // 初始化手机号数据文件
      try {
        await fs.access(this.phoneDataFile);
      } catch (error) {
        if (error.code === 'ENOENT') {
          await fs.writeFile(this.phoneDataFile, JSON.stringify({}, null, 2), 'utf-8');
        }
      }
    } catch (error) {
      console.error('初始化数据存储失败:', error);
    }
  }

  /**
   * 验证手机号格式
   * @param {string} phone - 手机号
   * @returns {boolean} 是否有效
   */
  validatePhone(phone) {
    if (!phone || typeof phone !== 'string') {
      return false;
    }
    // 中国大陆手机号验证规则
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  /**
   * 验证姓名格式
   * @param {string} name - 姓名
   * @returns {boolean} 是否有效
   */
  validateName(name) {
    if (!name || typeof name !== 'string') {
      return false;
    }
    // 允许中文、英文和点号（外国人姓名中间点）
    const nameRegex = /^[\u4e00-\u9fa5a-zA-Z\.]+$/;
    return nameRegex.test(name) && name.length >= 2 && name.length <= 20;
  }

  /**
   * 保存用户数据
   * @param {string} userId - 用户ID
   * @param {Object} userData - 用户数据
   * @returns {Promise<boolean>} 是否保存成功
   */
  async saveUserData(userId, userData) {
    try {
      await this.init();
      
      // 读取现有数据
      const data = JSON.parse(await fs.readFile(this.userDataFile, 'utf-8'));
      
      // 更新数据
      data[userId] = {
        ...userData,
        updatedAt: new Date().toISOString()
      };
      
      // 写入文件
      await fs.writeFile(this.userDataFile, JSON.stringify(data, null, 2), 'utf-8');
      
      return true;
    } catch (error) {
      console.error('保存用户数据失败:', error);
      return false;
    }
  }

  /**
   * 获取用户数据
   * @param {string} userId - 用户ID
   * @returns {Promise<Object|null>} 用户数据或null
   */
  async getUserData(userId) {
    try {
      await this.init();
      
      // 读取数据
      const data = JSON.parse(await fs.readFile(this.userDataFile, 'utf-8'));
      
      return data[userId] || null;
    } catch (error) {
      console.error('获取用户数据失败:', error);
      return null;
    }
  }

  /**
   * 删除用户数据
   * @param {string} userId - 用户ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  async deleteUserData(userId) {
    try {
      await this.init();
      
      // 读取数据
      const data = JSON.parse(await fs.readFile(this.userDataFile, 'utf-8'));
      
      // 删除数据
      if (data[userId]) {
        delete data[userId];
        await fs.writeFile(this.userDataFile, JSON.stringify(data, null, 2), 'utf-8');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('删除用户数据失败:', error);
      return false;
    }
  }

  /**
   * 保存手机号数据
   * @param {string} userId - 用户ID
   * @param {string} phone - 手机号
   * @returns {Promise<boolean>} 是否保存成功
   */
  async savePhoneData(userId, phone) {
    try {
      if (!this.validatePhone(phone)) {
        console.error('手机号格式无效');
        return false;
      }
      
      await this.init();
      
      // 读取现有数据
      const data = JSON.parse(await fs.readFile(this.phoneDataFile, 'utf-8'));
      
      // 更新数据
      data[userId] = {
        phone: phone,
        updatedAt: new Date().toISOString()
      };
      
      // 写入文件
      await fs.writeFile(this.phoneDataFile, JSON.stringify(data, null, 2), 'utf-8');
      
      return true;
    } catch (error) {
      console.error('保存手机号数据失败:', error);
      return false;
    }
  }

  /**
   * 获取手机号数据
   * @param {string} userId - 用户ID
   * @returns {Promise<string|null>} 手机号或null
   */
  async getPhoneData(userId) {
    try {
      await this.init();
      
      // 读取数据
      const data = JSON.parse(await fs.readFile(this.phoneDataFile, 'utf-8'));
      
      return data[userId]?.phone || null;
    } catch (error) {
      console.error('获取手机号数据失败:', error);
      return null;
    }
  }

  /**
   * 验证用户数据的完整性
   * @param {Object} userData - 用户数据
   * @returns {Object} 验证结果
   */
  validateUserData(userData) {
    const errors = [];
    
    if (!userData) {
      errors.push('用户数据不能为空');
    } else {
      if (userData.name && !this.validateName(userData.name)) {
        errors.push('姓名格式无效，必须为2-20个字符的中文或英文');
      }
      
      if (userData.phone && !this.validatePhone(userData.phone)) {
        errors.push('手机号格式无效，必须为11位中国大陆手机号');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = new UserDataStorage();