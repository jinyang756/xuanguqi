/**
 * api.js - 接口请求模块
 * 处理与后端API的通信
 */

class StockAPI {
    constructor() {
        // API基础配置
        this.baseUrl = '/api';
        
        // 请求超时设置
        this.timeout = 30000; // 30秒
        
        // 重试配置
        this.retryConfig = {
            maxRetries: 3,
            retryDelay: 1000, // 1秒
            retryableStatuses: [429, 500, 502, 503, 504] // 可重试的HTTP状态码
        };
        
        // 缓存配置
        this.cacheConfig = {
            enabled: true,
            defaultTtl: 15 * 60 * 1000, // 15分钟
            cacheKeyPrefix: 'stock_api_cache_'
        };
        
        // 认证信息
        this.authToken = null;
        
        // 初始化缓存
        this.initializeCache();
    }
    
    /**
     * 初始化缓存系统
     */
    initializeCache() {
        try {
            // 检查localStorage是否可用
            this.isCacheAvailable = typeof localStorage !== 'undefined';
        } catch (e) {
            this.isCacheAvailable = false;
        }
    }
    
    /**
     * 设置认证令牌
     * @param {string} token - JWT认证令牌
     */
    setAuthToken(token) {
        this.authToken = token;
        if (this.isCacheAvailable) {
            localStorage.setItem('stock_api_auth_token', token);
        }
    }
    
    /**
     * 获取认证令牌
     * @returns {string|null} 认证令牌
     */
    getAuthToken() {
        if (!this.authToken && this.isCacheAvailable) {
            this.authToken = localStorage.getItem('stock_api_auth_token');
        }
        return this.authToken;
    }
    
    /**
     * 清除认证令牌
     */
    clearAuthToken() {
        this.authToken = null;
        if (this.isCacheAvailable) {
            localStorage.removeItem('stock_api_auth_token');
        }
    }
    
    /**
     * 构建完整的API URL
     * @param {string} endpoint - API端点路径
     * @returns {string} 完整的URL
     */
    buildUrl(endpoint) {
        // 确保endpoint以斜杠开头
        if (!endpoint.startsWith('/')) {
            endpoint = '/' + endpoint;
        }
        return this.baseUrl + endpoint;
    }
    
    /**
     * 构建请求头
     * @returns {Object} 请求头对象
     */
    buildHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        // 如果有认证令牌，添加Authorization头
        const token = this.getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }
    
    /**
     * 执行HTTP请求
     * @param {string} method - HTTP方法
     * @param {string} endpoint - API端点
     * @param {Object} data - 请求数据
     * @param {Object} options - 额外选项
     * @returns {Promise<any>} 请求结果
     */
    async request(method, endpoint, data = null, options = {}) {
        const { skipCache = false, forceCache = false } = options;
        const url = this.buildUrl(endpoint);
        const cacheKey = this.getCacheKey(method, url, data);
        
        // 检查缓存
        if (!skipCache && this.cacheConfig.enabled) {
            const cachedResponse = this.getFromCache(cacheKey);
            if (cachedResponse) {
                console.debug(`从缓存获取: ${cacheKey}`);
                return cachedResponse;
            }
        }
        
        let retries = 0;
        let lastError = null;
        
        // 重试逻辑
        while (retries <= this.retryConfig.maxRetries) {
            try {
                // 设置超时
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);
                
                const response = await fetch(url, {
                    method,
                    headers: this.buildHeaders(),
                    body: data ? JSON.stringify(data) : null,
                    signal: controller.signal,
                    ...options
                });
                
                // 清除超时定时器
                clearTimeout(timeoutId);
                
                // 检查响应状态
                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    const errorMessage = errorData?.message || `HTTP错误: ${response.status}`;
                    
                    // 可重试的错误
                    if (this.retryConfig.retryableStatuses.includes(response.status) && retries < this.retryConfig.maxRetries) {
                        retries++;
                        console.warn(`请求失败，${retries}秒后重试(${retries}/${this.retryConfig.maxRetries})`);
                        lastError = new Error(errorMessage);
                        await this.delay(this.retryConfig.retryDelay * retries);
                        continue;
                    }
                    
                    // 不可重试的错误，直接抛出
                    throw new Error(errorMessage);
                }
                
                // 解析JSON响应
                const responseData = await response.json();
                
                // 缓存响应
                if ((!skipCache || forceCache) && this.cacheConfig.enabled) {
                    this.saveToCache(cacheKey, responseData);
                }
                
                return responseData;
            } catch (error) {
                // 请求被中止（超时）
                if (error.name === 'AbortError') {
                    throw new Error('请求超时');
                }
                
                // 网络错误，尝试重试
                if (!error.response && retries < this.retryConfig.maxRetries) {
                    retries++;
                    console.warn(`网络错误，${retries}秒后重试(${retries}/${this.retryConfig.maxRetries})`);
                    lastError = error;
                    await this.delay(this.retryConfig.retryDelay * retries);
                    continue;
                }
                
                throw lastError || error;
            }
        }
    }
    
    /**
     * 延迟函数
     * @param {number} ms - 延迟毫秒数
     * @returns {Promise<void>}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * 构建缓存键
     * @param {string} method - HTTP方法
     * @param {string} url - 请求URL
     * @param {Object} data - 请求数据
     * @returns {string} 缓存键
     */
    getCacheKey(method, url, data) {
        const dataStr = data ? JSON.stringify(data) : '';
        return `${this.cacheConfig.cacheKeyPrefix}${method}_${url}_${this.hashCode(dataStr)}`;
    }
    
    /**
     * 简单的字符串哈希函数
     * @param {string} str - 输入字符串
     * @returns {string} 哈希值
     */
    hashCode(str) {
        let hash = 0;
        if (str.length === 0) return hash.toString();
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return hash.toString();
    }
    
    /**
     * 从缓存获取数据
     * @param {string} key - 缓存键
     * @returns {any|null} 缓存的数据，如果不存在或已过期则返回null
     */
    getFromCache(key) {
        if (!this.isCacheAvailable) return null;
        
        try {
            const cached = localStorage.getItem(key);
            if (!cached) return null;
            
            const parsed = JSON.parse(cached);
            
            // 检查是否过期
            if (parsed.expiry && Date.now() > parsed.expiry) {
                localStorage.removeItem(key);
                return null;
            }
            
            return parsed.data;
        } catch (error) {
            console.error('从缓存读取失败:', error);
            return null;
        }
    }
    
    /**
     * 保存数据到缓存
     * @param {string} key - 缓存键
     * @param {any} data - 要缓存的数据
     * @param {number} ttl - 缓存有效期（毫秒）
     */
    saveToCache(key, data, ttl = null) {
        if (!this.isCacheAvailable) return;
        
        try {
            const cacheData = {
                data,
                timestamp: Date.now(),
                expiry: Date.now() + (ttl || this.cacheConfig.defaultTtl)
            };
            
            localStorage.setItem(key, JSON.stringify(cacheData));
        } catch (error) {
            console.error('保存到缓存失败:', error);
        }
    }
    
    /**
     * 清除缓存
     * @param {string} key - 缓存键，可选，如果不提供则清除所有缓存
     */
    clearCache(key = null) {
        if (!this.isCacheAvailable) return;
        
        try {
            if (key) {
                localStorage.removeItem(key);
            } else {
                // 清除所有以指定前缀开头的缓存
                const keys = Object.keys(localStorage);
                keys.forEach(k => {
                    if (k.startsWith(this.cacheConfig.cacheKeyPrefix)) {
                        localStorage.removeItem(k);
                    }
                });
            }
        } catch (error) {
            console.error('清除缓存失败:', error);
        }
    }
    
    // API方法
    
    /**
     * 用户登录
     * @param {string} phone - 手机号码
     * @param {string} code - 验证码
     * @returns {Promise<Object>} 登录结果
     */
    async login(phone, code) {
        const result = await this.request('POST', '/auth/login', { phone, code });
        if (result.token) {
            this.setAuthToken(result.token);
        }
        return result;
    }
    
    /**
     * 发送验证码
     * @param {string} phone - 手机号码
     * @returns {Promise<Object>} 发送结果
     */
    async sendVerificationCode(phone) {
        return this.request('POST', '/auth/send-code', { phone });
    }
    
    /**
     * 选股API
     * @param {string} strategy - 选股策略
     * @param {Object} params - 策略参数
     * @returns {Promise<Object>} 选股结果
     */
    async selectStocks(strategy, params = {}) {
        return this.request('POST', '/select-stocks', { strategy, params });
    }
    
    /**
     * 获取用户数据
     * @returns {Promise<Object>} 用户数据
     */
    async getUserData() {
        return this.request('GET', '/get-user-data');
    }
    
    /**
     * 保存用户数据
     * @param {Object} data - 用户数据
     * @returns {Promise<Object>} 保存结果
     */
    async saveUserData(data) {
        return this.request('POST', '/save-user-data', data);
    }
    
    /**
     * 删除用户数据
     * @returns {Promise<Object>} 删除结果
     */
    async deleteUserData() {
        return this.request('DELETE', '/delete-user-data');
    }
    
    /**
     * 导出用户数据
     * @returns {Promise<Object>} 导出结果
     */
    async exportUserData() {
        return this.request('GET', '/export-user-data');
    }
    
    /**
     * 获取免费股票数据
     * @param {string} type - 数据类型
     * @returns {Promise<Object>} 股票数据
     */
    async getFreeStockData(type = 'market_overview') {
        return this.request('GET', '/free-stock-data', { type }, { skipCache: true });
    }
    
    /**
     * 批量选股
     * @param {Array} strategies - 策略数组
     * @returns {Promise<Object>} 批量选股结果
     */
    async batchSelectStocks(strategies) {
        return this.request('POST', '/batch-select-stocks', { strategies });
    }
    
    /**
     * 获取系统状态
     * @returns {Promise<Object>} 系统状态信息
     */
    async getSystemStatus() {
        return this.request('GET', '/system-status', null, { skipCache: true });
    }
    
    /**
     * 健康检查
     * @returns {Promise<Object>} 健康检查结果
     */
    async healthCheck() {
        return this.request('GET', '/health', null, { skipCache: true });
    }

    /**
     * 获取策略列表
     * @returns {Promise<Object>} 策略列表
     */
    async getStrategyList() {
        try {
            // 首先尝试从服务器获取策略列表
            return await this.request('GET', '/strategies');
        } catch (error) {
            console.warn('从服务器获取策略列表失败，尝试使用本地模拟数据:', error);
            
            // 如果服务器请求失败，尝试直接从本地加载index.json文件
            try {
                // 在浏览器环境中，我们使用fetch来加载本地文件
                const response = await fetch('data/index.json');
                if (!response.ok) {
                    throw new Error(`Failed to load index.json: ${response.status}`);
                }
                
                const indexData = await response.json();
                
                // 格式化返回数据，保持与服务器API一致的格式
                return {
                    success: true,
                    data: indexData.strategies || [],
                    total: indexData.strategies?.length || 0
                };
            } catch (localError) {
                console.error('加载本地策略列表失败:', localError);
                
                // 返回默认策略列表作为降级方案
                return {
                    success: true,
                    data: [
                        {
                            id: 'default',
                            name: '默认策略',
                            description: '基础选股策略'
                        },
                        {
                            id: 'value_investing',
                            name: '价值投资策略',
                            description: '关注低估值、高分红的价值型股票'
                        },
                        {
                            id: 'growth_investing',
                            name: '成长投资策略',
                            description: '关注高增长、高景气度的成长型股票'
                        }
                    ],
                    total: 3
                };
            }
        }
    }

    /**
     * 上传自定义策略
     * @param {Object} strategyConfig - 策略配置
     * @returns {Promise<Object>} 上传结果
     */
    async uploadStrategy(strategyConfig) {
        return this.request('POST', '/strategies/upload', strategyConfig);
    }

    /**
     * 获取自定义指标
     * @returns {Promise<Object>} 自定义指标列表
     */
    async getCustomIndicators() {
        return this.request('GET', '/indicators');
    }
}

// 导出模块
export default StockAPI;