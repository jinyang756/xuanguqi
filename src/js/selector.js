/**
 * selector.js - 选股逻辑模块
 * 提供多因子选股、风险评估和数据清洗功能
 */

class StockSelector {
    constructor(stockData = []) {
        this.stockData = stockData;
        this.normalizationFactors = null;
        this.cleanedData = null; // 缓存清洗后的数据，避免重复计算
    }

    /**
     * 设置股票数据
     * @param {Array} data - 股票数据数组
     */
    setStockData(data) {
        this.stockData = data;
        this.normalizationFactors = null;
        this.cleanedData = null; // 重置缓存
    }

    /**
     * 获取清洗后的有效股票数据（带缓存）
     * @returns {Array} 清洗后的有效股票数据
     */
    getCleanedData() {
        // 如果已有缓存数据，直接返回
        if (this.cleanedData && this.cleanedData.length > 0) {
            return this.cleanedData;
        }
        
        try {
            // 筛选出信息齐全的股票
            const validStocks = this.stockData.filter(stock => {
                return stock.stock_name && stock.stock_name !== '未知股票' && 
                       stock.industry && stock.industry !== '未知' &&
                       stock.industry !== '未知行业' &&
                       typeof stock.close_price === 'number' && stock.close_price > 0 &&
                       typeof stock.change_percent === 'number' &&
                       typeof stock.pe === 'number' && stock.pe > 0 &&
                       typeof stock.roe === 'number' && stock.roe > 0 &&
                       typeof stock.market_cap === 'number' && stock.market_cap > 0 &&
                       typeof stock.volume === 'number' && stock.volume > 0 &&
                       typeof stock.pb === 'number' && stock.pb > 0;
            });

            // 过滤掉异常值
            const cleanedStocks = this.removeOutliers(validStocks);
            this.cleanedData = cleanedStocks;
            return cleanedStocks;
        } catch (error) {
            console.error('数据清洗失败:', error);
            return this.stockData;
        }
    }

    /**
     * 移除异常值
     * @param {Array} data - 原始数据
     * @returns {Array} 移除异常值后的数据
     */
    removeOutliers(data) {
        // 简单的异常值过滤逻辑，可以根据实际需求扩展
        const filteredData = data.filter(stock => {
            return stock.pe < 100 && // 过滤掉极高市盈率的股票
                   stock.pb < 10 &&  // 过滤掉极高市净率的股票
                   stock.roe < 50;   // 过滤掉异常高ROE的股票
        });
        return filteredData;
    }

    /**
     * 初始化归一化因子
     */
    initNormalizationFactors() {
        const data = this.getCleanedData();
        if (!data || data.length === 0) return;

        this.normalizationFactors = {
            price: { min: Infinity, max: -Infinity },
            pe: { min: Infinity, max: -Infinity },
            pb: { min: Infinity, max: -Infinity },
            roe: { min: Infinity, max: -Infinity },
            volume: { min: Infinity, max: -Infinity }
        };

        // 计算每个因子的最大值和最小值
        data.forEach(stock => {
            this.normalizationFactors.price.min = Math.min(this.normalizationFactors.price.min, stock.close_price);
            this.normalizationFactors.price.max = Math.max(this.normalizationFactors.price.max, stock.close_price);
            this.normalizationFactors.pe.min = Math.min(this.normalizationFactors.pe.min, stock.pe);
            this.normalizationFactors.pe.max = Math.max(this.normalizationFactors.pe.max, stock.pe);
            this.normalizationFactors.pb.min = Math.min(this.normalizationFactors.pb.min, stock.pb);
            this.normalizationFactors.pb.max = Math.max(this.normalizationFactors.pb.max, stock.pb);
            this.normalizationFactors.roe.min = Math.min(this.normalizationFactors.roe.min, stock.roe);
            this.normalizationFactors.roe.max = Math.max(this.normalizationFactors.roe.max, stock.roe);
            this.normalizationFactors.volume.min = Math.min(this.normalizationFactors.volume.min, stock.volume);
            this.normalizationFactors.volume.max = Math.max(this.normalizationFactors.volume.max, stock.volume);
        });
    }

    /**
     * 归一化数据
     * @param {number} value - 原始值
     * @param {string} factorName - 因子名称
     * @returns {number} 归一化后的值（0-1之间）
     */
    normalize(value, factorName) {
        if (!this.normalizationFactors) {
            this.initNormalizationFactors();
        }

        const factor = this.normalizationFactors[factorName];
        if (!factor) return value;

        // 防止除零错误
        if (factor.max === factor.min) return 0.5;

        return (value - factor.min) / (factor.max - factor.min);
    }

    /**
     * 综合评分选股
     * @param {Object} weights - 各因子权重
     * @param {number} topN - 返回排名前N的股票
     * @returns {Array} 选股结果
     */
    selectByCompositeScore(weights = {}, topN = 20) {
        const data = this.getCleanedData();
        if (!data || data.length === 0) return [];

        // 默认权重
        const defaultWeights = {
            pe: 0.2,      // 市盈率（越低越好）
            pb: 0.15,     // 市净率（越低越好）
            roe: 0.25,    // 净资产收益率（越高越好）
            volume: 0.1,  // 成交量（越高越好）
            change: 0.1,  // 涨跌幅（越高越好）
            industry: 0.2 // 行业分布
        };

        // 合并用户权重和默认权重
        const finalWeights = { ...defaultWeights, ...weights };

        // 为每只股票计算综合得分
        const scoredStocks = data.map(stock => {
            // 计算各因子得分
            const peScore = 1 - this.normalize(stock.pe, 'pe'); // 市盈率越低越好
            const pbScore = 1 - this.normalize(stock.pb, 'pb'); // 市净率越低越好
            const roeScore = this.normalize(stock.roe, 'roe');  // ROE越高越好
            const volumeScore = this.normalize(stock.volume, 'volume'); // 成交量越高越好
            const changeScore = Math.max(0, stock.change_percent / 10); // 涨跌幅转换为0-10分
            
            // 行业分散度得分（简单实现）
            // 实际应用中可能需要更复杂的行业轮动策略
            const industryScore = 1; // 暂时设为固定值

            // 计算加权综合得分
            const compositeScore = 
                peScore * finalWeights.pe +
                pbScore * finalWeights.pb +
                roeScore * finalWeights.roe +
                volumeScore * finalWeights.volume +
                changeScore * finalWeights.change +
                industryScore * finalWeights.industry;

            return {
                ...stock,
                compositeScore: Math.min(100, Math.max(0, compositeScore * 100)) // 归一化到0-100分
            };
        });

        // 按综合得分降序排序
        scoredStocks.sort((a, b) => b.compositeScore - a.compositeScore);

        // 返回排名前N的股票
        return scoredStocks.slice(0, topN);
    }

    /**
     * 行业轮动选股
     * @param {Array} targetIndustries - 目标行业列表
     * @param {number} topN - 每个行业返回的股票数量
     * @returns {Array} 选股结果
     */
    selectByIndustryRotation(targetIndustries = [], topN = 5) {
        const data = this.getCleanedData();
        if (!data || data.length === 0) return [];

        // 如果没有指定目标行业，选择所有行业
        const industries = targetIndustries.length > 0 ? targetIndustries : [...new Set(data.map(stock => stock.industry))];
        
        const results = [];

        // 对每个目标行业，选择表现最好的N只股票
        industries.forEach(industry => {
            const industryStocks = data.filter(stock => stock.industry === industry);
            
            if (industryStocks.length > 0) {
                // 按ROE降序排序（可以根据实际需求调整排序指标）
                industryStocks.sort((a, b) => b.roe - a.roe);
                
                // 取前N只股票
                results.push(...industryStocks.slice(0, topN));
            }
        });

        return results;
    }

    /**
     * 价值投资选股
     * @param {number} topN - 返回的股票数量
     * @returns {Array} 选股结果
     */
    selectValueStocks(topN = 20) {
        const data = this.getCleanedData();
        if (!data || data.length === 0) return [];

        // 价值投资策略：低PE、低PB、高ROE
        const valueStocks = data.filter(stock => {
            return stock.pe < 15 && // 低市盈率
                   stock.pb < 2 &&  // 低市净率
                   stock.roe > 15;  // 高ROE
        });

        // 按ROE降序排序
        valueStocks.sort((a, b) => b.roe - a.roe);

        return valueStocks.slice(0, topN);
    }

    /**
     * 成长投资选股
     * @param {number} topN - 返回的股票数量
     * @returns {Array} 选股结果
     */
    selectGrowthStocks(topN = 20) {
        const data = this.getCleanedData();
        if (!data || data.length === 0) return [];

        // 成长投资策略：高增长潜力
        // 这里简化处理，实际应用中可能需要更多的成长指标
        const growthStocks = data.filter(stock => {
            // 高涨幅、高成交量、适中的PE（不能太低也不能太高）
            return stock.change_percent > 0 && // 正增长
                   stock.volume > 10000000 && // 较高成交量
                   stock.pe > 20 && stock.pe < 50; // 适中的PE
        });

        // 按涨跌幅降序排序
        growthStocks.sort((a, b) => b.change_percent - a.change_percent);

        return growthStocks.slice(0, topN);
    }
}

// 导出模块
export default StockSelector;