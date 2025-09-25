/**
 * strategy.js - 策略配置模块
 * 管理各种选股策略的配置和参数
 */

class StrategyManager {
    constructor() {
        // 策略配置库
        this.strategyConfigs = {
            // 默认策略
            default: {
                name: '默认选股',
                description: '综合考虑多种因子的选股策略',
                params: {
                    weights: {
                        pe: 0.2,
                        pb: 0.15,
                        roe: 0.25,
                        volume: 0.1,
                        change: 0.1,
                        industry: 0.2
                    },
                    topN: 20
                },
                method: 'selectByCompositeScore'
            },
            
            // 价值投资策略
            value: {
                name: '价值投资',
                description: '关注低PE、低PB、高ROE的价值股',
                params: {
                    topN: 20
                },
                method: 'selectValueStocks'
            },
            
            // 成长投资策略
            growth: {
                name: '成长投资',
                description: '关注高增长潜力的成长股',
                params: {
                    topN: 20
                },
                method: 'selectGrowthStocks'
            },
            
            // 行业轮动策略
            industry: {
                name: '行业轮动',
                description: '在指定行业中选择优质股票',
                params: {
                    targetIndustries: [],
                    topN: 5
                },
                method: 'selectByIndustryRotation'
            },
            
            // 短期突破策略
            breakout: {
                name: '短期突破',
                description: '寻找短期突破的强势股',
                params: {
                    volumeRatioThreshold: 1.5,      // 量比阈值
                    changePercentThreshold: 2,      // 涨幅阈值（百分比）
                    turnoverRateThreshold: 5,       // 换手率阈值（百分比）
                    priceChangeThreshold: 3,        // 价格变化阈值（百分比）
                    daysRangeThreshold: 15,         // 天数范围阈值
                    marketCapThreshold: 10000000000 // 市值阈值（元）
                },
                method: 'selectByBreakout'
            },
            
            // 低估值策略
            lowValuation: {
                name: '低估值精选',
                description: '筛选估值较低的优质股票',
                params: {
                    peThreshold: 15,       // PE阈值
                    pbThreshold: 1.5,      // PB阈值
                    roeThreshold: 10,      // ROE阈值
                    marketCapMin: 5000000000,  // 最小市值
                    dividendRateMin: 2     // 最小股息率
                },
                method: 'selectLowValuation'
            },
            
            // 动量策略
            momentum: {
                name: '动量策略',
                description: '追随市场趋势的动量投资',
                params: {
                    periodDays: 20,        // 计算周期（天）
                    topPercent: 10,        // 选取前百分之几的股票
                    minVolume: 10000000    // 最小成交量
                },
                method: 'selectByMomentum'
            }
        };
        
        // 当前激活的策略
        this.activeStrategy = 'default';
        
        // 用户自定义策略
        this.customStrategies = {};
    }
    
    /**
     * 获取所有可用策略
     * @returns {Object} 所有策略配置
     */
    getAllStrategies() {
        return {
            ...this.strategyConfigs,
            ...this.customStrategies
        };
    }
    
    /**
     * 获取所有可用策略（兼容旧接口）
     * @returns {Object} 所有策略配置
     */
    getAvailableStrategies() {
        return this.getAllStrategies();
    }
    
    /**
     * 获取策略配置
     * @param {string} strategyId - 策略ID
     * @returns {Object|null} 策略配置对象，如果不存在则返回null
     */
    getStrategy(strategyId) {
        if (this.strategyConfigs[strategyId]) {
            return { ...this.strategyConfigs[strategyId] };
        } else if (this.customStrategies[strategyId]) {
            return { ...this.customStrategies[strategyId] };
        }
        return null;
    }
    
    /**
     * 设置激活策略
     * @param {string} strategyId - 策略ID
     * @returns {boolean} 是否设置成功
     */
    setActiveStrategy(strategyId) {
        const allStrategies = this.getAllStrategies();
        if (allStrategies[strategyId]) {
            this.activeStrategy = strategyId;
            return true;
        }
        return false;
    }
    
    /**
     * 获取当前激活策略
     * @returns {Object} 当前激活策略配置
     */
    getActiveStrategy() {
        return this.getStrategy(this.activeStrategy);
    }
    
    /**
     * 创建自定义策略
     * @param {string} strategyId - 策略ID
     * @param {Object} config - 策略配置
     * @returns {boolean} 是否创建成功
     */
    createCustomStrategy(strategyId, config) {
        if (this.strategyConfigs[strategyId]) {
            console.error('策略ID已存在：', strategyId);
            return false;
        }
        
        // 验证配置格式
        if (!config.name || !config.description || !config.params || !config.method) {
            console.error('策略配置不完整');
            return false;
        }
        
        this.customStrategies[strategyId] = {
            name: config.name,
            description: config.description,
            params: { ...config.params },
            method: config.method,
            isCustom: true
        };
        
        return true;
    }
    
    /**
     * 更新策略参数
     * @param {string} strategyId - 策略ID
     * @param {Object} newParams - 新的参数配置
     * @returns {boolean} 是否更新成功
     */
    updateStrategyParams(strategyId, newParams) {
        let strategy;
        
        if (this.strategyConfigs[strategyId]) {
            strategy = this.strategyConfigs[strategyId];
        } else if (this.customStrategies[strategyId]) {
            strategy = this.customStrategies[strategyId];
        } else {
            return false;
        }
        
        // 合并新参数，保留未更新的参数
        strategy.params = {
            ...strategy.params,
            ...newParams
        };
        
        return true;
    }
    
    /**
     * 删除自定义策略
     * @param {string} strategyId - 策略ID
     * @returns {boolean} 是否删除成功
     */
    deleteCustomStrategy(strategyId) {
        if (this.customStrategies[strategyId]) {
            delete this.customStrategies[strategyId];
            // 如果删除的是当前激活策略，切换到默认策略
            if (this.activeStrategy === strategyId) {
                this.activeStrategy = 'default';
            }
            return true;
        }
        return false;
    }
    
    /**
     * 导出策略配置
     * @returns {string} JSON格式的策略配置
     */
    exportStrategies() {
        return JSON.stringify({
            activeStrategy: this.activeStrategy,
            customStrategies: this.customStrategies
        }, null, 2);
    }
    
    /**
     * 导入策略配置
     * @param {string} jsonData - JSON格式的策略配置
     * @returns {boolean} 是否导入成功
     */
    importStrategies(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.activeStrategy) {
                this.setActiveStrategy(data.activeStrategy);
            }
            
            if (data.customStrategies && typeof data.customStrategies === 'object') {
                this.customStrategies = { ...data.customStrategies };
            }
            
            return true;
        } catch (error) {
            console.error('导入策略配置失败:', error);
            return false;
        }
    }
    
    /**
     * 获取策略分类
     * @returns {Object} 按分类组织的策略
     */
    getStrategiesByCategory() {
        const categories = {
            basic: [],    // 基础策略
            advanced: [], // 高级策略
            custom: []    // 自定义策略
        };
        
        // 将内置策略分类
        Object.entries(this.strategyConfigs).forEach(([id, config]) => {
            if (['default', 'value', 'growth', 'industry'].includes(id)) {
                categories.basic.push({ id, ...config });
            } else {
                categories.advanced.push({ id, ...config });
            }
        });
        
        // 添加自定义策略
        Object.entries(this.customStrategies).forEach(([id, config]) => {
            categories.custom.push({ id, ...config });
        });
        
        return categories;
    }
    
    /**
     * 验证策略参数
     * @param {string} strategyId - 策略ID
     * @param {Object} params - 要验证的参数
     * @returns {Object} 验证结果 { isValid: boolean, errors: Array }
     */
    validateStrategyParams(strategyId, params) {
        const strategy = this.getStrategy(strategyId);
        if (!strategy) {
            return { isValid: false, errors: ['策略不存在'] };
        }
        
        const errors = [];
        
        // 检查必需参数
        Object.entries(strategy.params).forEach(([key, defaultValue]) => {
            if (params[key] === undefined && defaultValue === undefined) {
                errors.push(`缺少必需参数: ${key}`);
            }
        });
        
        // 根据参数类型进行验证
        Object.entries(params).forEach(([key, value]) => {
            const defaultValue = strategy.params[key];
            if (defaultValue !== undefined) {
                const expectedType = typeof defaultValue;
                const actualType = typeof value;
                
                if (actualType !== expectedType) {
                    errors.push(`参数 ${key} 类型错误: 期望 ${expectedType}, 实际 ${actualType}`);
                }
                
                // 数值类型的范围验证
                if (actualType === 'number') {
                    if (value < 0 && !['volumeRatioThreshold', 'changePercentThreshold'].includes(key)) {
                        errors.push(`参数 ${key} 不能为负数`);
                    }
                }
                
                // 数组类型的验证
                if (Array.isArray(defaultValue) && !Array.isArray(value)) {
                    errors.push(`参数 ${key} 应为数组`);
                }
            }
        });
        
        return { isValid: errors.length === 0, errors };
    }
    
    /**
     * 执行指定策略
     * @param {string} strategyId - 策略ID
     * @param {Object} params - 策略参数
     * @returns {Promise<Object>} 执行结果 {success: boolean, data?: Array, error?: string}
     */
    async executeStrategy(strategyId, params) {
        try {
            // 验证策略是否存在
            const strategy = this.getStrategy(strategyId);
            if (!strategy) {
                return { success: false, error: `策略 ${strategyId} 不存在` };
            }

            // 验证参数
            const validationResult = this.validateStrategyParams(strategyId, params);
            if (!validationResult.isValid) {
                return { success: false, error: validationResult.errors.join(', ') };
            }

            // 合并默认参数和用户提供的参数
            const mergedParams = {
                ...strategy.params,
                ...params
            };

            // 检查是否设置了选股器实例
            if (!this.stockSelector) {
                console.warn('选股器实例未设置，使用模拟数据');
                // 模拟选股结果
                const mockResults = [
                    { code: '000001', name: '平安银行', price: 12.34, priceChange: 2.34, pe: 5.67, pb: 0.89, industry: '银行', score: 85.5 },
                    { code: '600519', name: '贵州茅台', price: 1899.00, priceChange: -1.23, pe: 28.9, pb: 9.8, industry: '酿酒', score: 78.3 },
                    { code: '000858', name: '五粮液', price: 168.50, priceChange: 0.89, pe: 19.6, pb: 5.2, industry: '酿酒', score: 82.1 }
                ];
                return { success: true, data: mockResults };
            }

            // 执行对应的选股方法
            const method = this.stockSelector[strategy.method];
            if (typeof method !== 'function') {
                return { success: false, error: `选股器中未找到方法: ${strategy.method}` };
            }

            // 调用选股方法
            const result = await method.call(this.stockSelector, mergedParams);
            return { success: true, data: result };
        } catch (error) {
            console.error('执行策略时出错:', error);
            return { success: false, error: error.message || '执行策略失败' };
        }
    }

    /**
     * 设置选股器实例
     * @param {Object} selector - StockSelector实例
     */
    setStockSelector(selector) {
        this.stockSelector = selector;
    }
    
    // 原有方法...

}

// 导出模块
export default StrategyManager;