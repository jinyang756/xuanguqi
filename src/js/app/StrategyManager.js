/**
 * 策略管理器模块
 * 负责管理各种选股策略，包括策略注册、获取和执行
 */
import { StockSelector } from '../selector.js';

/**
 * 策略管理器类
 */
export class StrategyManager {
    constructor() {
        // 策略配置映射表
        this.strategyConfigs = new Map();
        // 选股器实例
        this.stockSelector = null;
        // 策略执行历史
        this.executionHistory = [];
        
        // 初始化内置策略
        this.initBuiltInStrategies();
    }

    /**
     * 设置选股器实例
     * @param {StockSelector} selector - StockSelector实例
     */
    setStockSelector(selector) {
        if (selector instanceof StockSelector) {
            this.stockSelector = selector;
        } else {
            console.error('设置的选股器不是StockSelector实例');
        }
    }

    /**
     * 初始化内置策略
     */
    initBuiltInStrategies() {
        // 注册综合评分策略
        this.registerStrategy({
            id: 'composite',
            name: '综合评分',
            description: '基于多因子综合评分的选股策略，兼顾价值与成长',
            defaultParams: {
                weights: {
                    pe: 0.2,
                    pb: 0.15,
                    roe: 0.25,
                    volume: 0.1,
                    change: 0.1,
                    industry: 0.2
                },
                count: 20
            },
            parameterSchema: {
                weights: {
                    type: 'object',
                    properties: {
                        pe: { type: 'number', minimum: 0, maximum: 1 },
                        pb: { type: 'number', minimum: 0, maximum: 1 },
                        roe: { type: 'number', minimum: 0, maximum: 1 },
                        volume: { type: 'number', minimum: 0, maximum: 1 },
                        change: { type: 'number', minimum: 0, maximum: 1 },
                        industry: { type: 'number', minimum: 0, maximum: 1 }
                    }
                },
                count: { type: 'number', minimum: 1, maximum: 100 }
            }
        });

        // 注册行业轮动策略
        this.registerStrategy({
            id: 'industryRotation',
            name: '行业轮动',
            description: '在指定行业中选择优质股票，实现行业轮动配置',
            defaultParams: {
                industries: [],
                count: 5
            },
            parameterSchema: {
                industries: { type: 'array', items: { type: 'string' } },
                count: { type: 'number', minimum: 1, maximum: 20 }
            }
        });

        // 注册价值投资策略
        this.registerStrategy({
            id: 'value',
            name: '价值投资',
            description: '选择低估值、高盈利能力的价值型股票',
            defaultParams: {
                count: 20
            },
            parameterSchema: {
                count: { type: 'number', minimum: 1, maximum: 50 }
            }
        });

        // 注册成长投资策略
        this.registerStrategy({
            id: 'growth',
            name: '成长投资',
            description: '选择高增长潜力的成长型股票',
            defaultParams: {
                count: 20
            },
            parameterSchema: {
                count: { type: 'number', minimum: 1, maximum: 50 }
            }
        });

        // 注册突破策略
        this.registerStrategy({
            id: 'breakout',
            name: '突破策略',
            description: '选择近期有突破迹象的股票',
            defaultParams: {
                count: 15,
                priceThreshold: 1.02, // 突破百分比阈值
                volumeThreshold: 1.5  // 成交量放大阈值
            },
            parameterSchema: {
                count: { type: 'number', minimum: 1, maximum: 30 },
                priceThreshold: { type: 'number', minimum: 1.01, maximum: 1.1 },
                volumeThreshold: { type: 'number', minimum: 1.2, maximum: 3 }
            }
        });
    }

    /**
     * 注册一个新的选股策略
     * @param {Object} strategyConfig - 策略配置对象
     * @returns {boolean} 注册是否成功
     */
    registerStrategy(strategyConfig) {
        try {
            // 验证策略配置的基本结构
            if (!strategyConfig || !strategyConfig.id || !strategyConfig.name) {
                console.error('策略配置不完整，需要id和name字段');
                return false;
            }

            // 为策略配置设置默认值
            const config = {
                ...strategyConfig,
                defaultParams: strategyConfig.defaultParams || {},
                description: strategyConfig.description || '',
                parameterSchema: strategyConfig.parameterSchema || {}
            };

            // 注册策略
            this.strategyConfigs.set(config.id, config);
            console.log(`策略已注册: ${config.name} (${config.id})`);
            return true;
        } catch (error) {
            console.error('注册策略失败:', error);
            return false;
        }
    }

    /**
     * 获取所有已注册的策略配置
     * @returns {Array} 策略配置数组
     */
    getAllStrategies() {
        return Array.from(this.strategyConfigs.values());
    }

    /**
     * 根据策略ID获取策略配置
     * @param {string} strategyId - 策略ID
     * @returns {Object|null} 策略配置对象，如果不存在则返回null
     */
    getStrategyById(strategyId) {
        return this.strategyConfigs.get(strategyId) || null;
    }

    /**
     * 验证策略参数是否符合模式
     * @param {Object} params - 要验证的参数
     * @param {Object} schema - 参数模式
     * @returns {Object} 验证结果 { isValid: boolean, errors: Array }
     */
    validateParameters(params, schema) {
        const errors = [];
        
        // 简单的参数验证逻辑
        for (const [key, config] of Object.entries(schema)) {
            const value = params[key];
            
            // 如果参数不存在且没有默认值，则不进行验证
            if (value === undefined || value === null) continue;
            
            // 类型验证
            if (config.type && typeof value !== config.type) {
                errors.push(`参数 ${key} 应该是 ${config.type} 类型`);
                continue;
            }
            
            // 数值范围验证
            if (typeof value === 'number') {
                if (config.minimum !== undefined && value < config.minimum) {
                    errors.push(`参数 ${key} 不能小于 ${config.minimum}`);
                }
                if (config.maximum !== undefined && value > config.maximum) {
                    errors.push(`参数 ${key} 不能大于 ${config.maximum}`);
                }
            }
            
            // 数组验证
            if (config.type === 'array' && Array.isArray(value)) {
                if (config.items && config.items.type) {
                    const invalidItems = value.filter(item => typeof item !== config.items.type);
                    if (invalidItems.length > 0) {
                        errors.push(`参数 ${key} 中的元素应该是 ${config.items.type} 类型`);
                    }
                }
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * 执行指定的选股策略
     * @param {string} strategyId - 策略ID
     * @param {Object} params - 策略参数
     * @returns {Promise<Object>} 包含选股结果的Promise
     */
    async executeStrategy(strategyId, params = {}) {
        return new Promise((resolve, reject) => {
            try {
                // 检查选股器是否已设置
                if (!this.stockSelector) {
                    throw new Error('选股器尚未设置，请先调用setStockSelector方法');
                }
                
                // 检查策略是否存在
                const strategy = this.getStrategyById(strategyId);
                if (!strategy) {
                    throw new Error(`策略 ${strategyId} 不存在`);
                }
                
                // 合并默认参数和用户参数
                const mergedParams = {
                    ...strategy.defaultParams,
                    ...params
                };
                
                // 验证参数
                const validationResult = this.validateParameters(mergedParams, strategy.parameterSchema);
                if (!validationResult.isValid) {
                    throw new Error(`参数验证失败: ${validationResult.errors.join(', ')}`);
                }
                
                console.log(`执行策略: ${strategy.name}，参数:`, mergedParams);
                
                // 执行选股
                const startTime = Date.now();
                const results = this.stockSelector.executeStrategy(strategyId, mergedParams);
                const executionTime = Date.now() - startTime;
                
                // 记录执行历史
                const executionRecord = {
                    strategyId,
                    strategyName: strategy.name,
                    params: mergedParams,
                    timestamp: new Date(),
                    executionTime: executionTime,
                    resultCount: results.length
                };
                
                this.executionHistory.push(executionRecord);
                
                // 限制历史记录数量
                if (this.executionHistory.length > 100) {
                    this.executionHistory.shift();
                }
                
                // 返回结果
                resolve({
                    success: true,
                    data: results,
                    meta: {
                        strategyId,
                        strategyName: strategy.name,
                        executionTime: executionTime,
                        totalCount: results.length
                    }
                });
            } catch (error) {
                console.error('执行策略失败:', error);
                reject({
                    success: false,
                    error: error.message || '执行策略时发生错误',
                    strategyId
                });
            }
        });
    }

    /**
     * 获取策略执行历史
     * @param {number} limit - 返回的历史记录数量限制
     * @returns {Array} 执行历史数组
     */
    getExecutionHistory(limit = 10) {
        return this.executionHistory.slice(-limit).reverse();
    }

    /**
     * 清除策略执行历史
     */
    clearExecutionHistory() {
        this.executionHistory = [];
        console.log('策略执行历史已清除');
    }

    /**
     * 获取策略统计信息
     * @returns {Object} 统计信息对象
     */
    getStrategyStatistics() {
        const stats = {};
        
        // 初始化每个策略的统计信息
        this.strategyConfigs.forEach((config, id) => {
            stats[id] = {
                name: config.name,
                executionCount: 0,
                averageExecutionTime: 0,
                totalExecutionTime: 0
            };
        });
        
        // 计算统计数据
        this.executionHistory.forEach(record => {
            if (stats[record.strategyId]) {
                stats[record.strategyId].executionCount++;
                stats[record.strategyId].totalExecutionTime += record.executionTime;
                stats[record.strategyId].averageExecutionTime = 
                    stats[record.strategyId].totalExecutionTime / stats[record.strategyId].executionCount;
            }
        });
        
        return stats;
    }
}

// 默认导出
const strategyManager = new StrategyManager();
export default strategyManager;