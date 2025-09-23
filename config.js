// 应用配置文件
// 用于控制应用行为，例如使用虚拟数据还是真实数据
const appConfig = {
    // 数据来源配置
    dataSource: {
        // 设置为 true 时使用本地虚拟数据，设置为 false 时使用真实 API 数据
        useMockData: true,
        
        // 虚拟数据文件路径
        mockDataFile: 'data/processed/stock_data_strategy_test.json',
        
        // 真实 API 配置（当 useMockData 为 false 时生效）
        apiConfig: {
            // Tushare API 相关配置
            tushare: {
                apiKey: '', // 在使用真实数据时需要填写
                retryTimes: 3,
                timeout: 10000
            }
        }
    },
    
    // 缓存配置
    cache: {
        enabled: true,
        expireTime: 24 * 60 * 60 * 1000, // 缓存过期时间，单位毫秒（默认24小时）
        storageKey: 'stock_data_cache'
    },
    
    // 超级管理员配置
    superAdmin: {
        // 超级管理员电话号码列表，这些号码可以无限制使用选股器功能
        phoneNumbers: ['18066668888'],
        // 超级管理员无使用限制
        unlimitedUsage: true
    },
    
    // 选股算法配置
    strategy: {
        // 短期突破选股策略配置
        breakout: {
            volumeRatioThreshold: 1.5,      // 量比阈值
            changePercentThreshold: 2,      // 涨幅阈值（百分比）
            turnoverRateThreshold: 5,       // 换手率阈值（百分比）
            maxResults: 10                  // 最大返回结果数量
        },
        
        // 短期上涨潜力选股策略配置
        shortTermGrowth: {
            maxResults: 5                   // 最大返回结果数量
        },
        
        // 行业分散投资配置
        diversifiedPortfolio: {
            stocksPerIndustry: 1,           // 每个行业选取的股票数量
            maxIndustries: 8                // 最大行业数量
        }
    },
    
    // 调试模式配置
    debug: {
        enabled: false,          // 是否启用调试模式
        verboseLogging: false,   // 是否显示详细日志
        mockNetworkDelay: 0      // 模拟网络延迟（毫秒），用于测试加载状态
    }
};

// 导出配置对象
export default appConfig;

// 为了兼容不支持 ES6 模块的环境，同时挂载到 window 对象
if (typeof window !== 'undefined') {
    window.appConfig = appConfig;
}