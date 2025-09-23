/**
 * stock_selector.js - 高级股票选择算法模块
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
                return stock.name && stock.name !== '未知股票' && 
                       stock.industry && stock.industry !== '未知' &&
                       stock.industry !== '未知行业' &&
                       typeof stock.price === 'number' && stock.price > 0 &&
                       typeof stock.priceChange === 'number' &&
                       typeof stock.pe === 'number' && stock.pe > 0 &&
                       typeof stock.roe === 'number' && stock.roe > 0 &&
                       typeof stock.marketCap === 'number' && stock.marketCap > 0 &&
                       typeof stock.volume === 'number' && stock.volume > 0 &&
                       typeof stock.turnoverRate === 'number' && stock.turnoverRate > 0 &&
                       typeof stock.pb === 'number' && stock.pb > 0;
            });

            // 过滤掉异常值
            const cleanedStocks = this.removeOutliers(validStocks);
            
            // 计算归一化因子
            this.calculateNormalizationFactors(cleanedStocks);
            
            // 缓存结果
            this.cleanedData = cleanedStocks;
            return cleanedStocks;
        } catch (error) {
            console.error('数据清洗过程中发生错误:', error);
            return [];
        }
    }

    /**
     * 移除异常值
     * @param {Array} stocks - 股票数据数组
     * @returns {Array} 过滤异常值后的股票数据
     */
    removeOutliers(stocks) {
        // 对关键指标计算四分位数，移除异常值
        const keyMetrics = ['priceChange', 'pe', 'roe', 'turnoverRate', 'volume'];
        let filteredStocks = [...stocks];
        
        keyMetrics.forEach(metric => {
            if (filteredStocks.length === 0) return;
            
            try {
                const values = filteredStocks.map(stock => stock[metric]).sort((a, b) => a - b);
                const q1 = values[Math.floor(values.length * 0.25)];
                const q3 = values[Math.floor(values.length * 0.75)];
                const iqr = q3 - q1;
                const lowerBound = q1 - 1.5 * iqr;
                const upperBound = q3 + 1.5 * iqr;
                
                filteredStocks = filteredStocks.filter(stock => 
                    stock[metric] >= lowerBound && stock[metric] <= upperBound
                );
            } catch (error) {
                console.error(`处理指标 ${metric} 的异常值时出错:`, error);
                // 出错时跳过该指标的异常值处理，保留当前数据
            }
        });
        
        return filteredStocks;
    }

    /**
     * 计算归一化因子
     * @param {Array} stocks - 股票数据数组
     */
    calculateNormalizationFactors(stocks) {
        if (!stocks || stocks.length === 0) return;
        
        this.normalizationFactors = {};
        const metrics = ['priceChange', 'pe', 'roe', 'turnoverRate', 'volume', 'marketCap', 'pb'];
        
        metrics.forEach(metric => {
            try {
                const values = stocks.map(stock => stock[metric]);
                const min = Math.min(...values);
                const max = Math.max(...values);
                
                this.normalizationFactors[metric] = {
                    min,
                    max,
                    range: max - min || 1 // 避免除零错误
                };
            } catch (error) {
                console.error(`计算指标 ${metric} 的归一化因子时出错:`, error);
                // 出错时设置默认归一化因子
                this.normalizationFactors[metric] = {
                    min: 0,
                    max: 1,
                    range: 1
                };
            }
        });
    }

    /**
     * 归一化指标值
     * @param {number} value - 原始值
     * @param {string} metric - 指标名称
     * @returns {number} 归一化后的值(0-1)
     */
    normalizeValue(value, metric) {
        if (!this.normalizationFactors || !this.normalizationFactors[metric]) {
            return 0;
        }
        
        const { min, range } = this.normalizationFactors[metric];
        // 确保归一化结果在0-1范围内
        return Math.max(0, Math.min(1, (value - min) / range));
    }

    /**
     * 计算短期上涨潜力评分（抽取为可复用方法）
     * @param {Object} stock - 股票数据
     * @returns {number} 评分（0-1）
     */
    calculateShortTermGrowthScore(stock) {
        try {
            // 归一化各项指标
            const normPriceChange = this.normalizeValue(stock.priceChange, 'priceChange');
            const normTurnoverRate = this.normalizeValue(stock.turnoverRate, 'turnoverRate');
            
            // 成交量需要考虑市值大小进行调整
            const relativeVolume = stock.volume / (stock.marketCap || 1);
            const normRelativeVolume = this.normalizeValue(relativeVolume, 'volume');
            
            // 基本面因子 - PE和ROE结合
            const peScore = 1 - this.normalizeValue(stock.pe, 'pe'); // PE低的更好
            const roeScore = this.normalizeValue(stock.roe, 'roe');
            const fundamentalScore = (peScore * 0.4 + roeScore * 0.6);
            
            // 技术面因子 - 涨跌幅、换手率、相对成交量
            const technicalScore = (normPriceChange * 0.4 + normTurnoverRate * 0.3 + normRelativeVolume * 0.3);
            
            // 综合评分
            return (technicalScore * 0.7) + (fundamentalScore * 0.3);
        } catch (error) {
            console.error(`计算股票 ${stock.name || stock.code} 评分时出错:`, error);
            return 0;
        }
    }

    /**
     * 计算技术面评分（抽取为可复用方法）
     * @param {Object} stock - 股票数据
     * @returns {number} 评分（0-1）
     */
    calculateTechnicalScore(stock) {
        try {
            const normPriceChange = this.normalizeValue(stock.priceChange, 'priceChange');
            const normTurnoverRate = this.normalizeValue(stock.turnoverRate, 'turnoverRate');
            const relativeVolume = stock.volume / (stock.marketCap || 1);
            const normRelativeVolume = this.normalizeValue(relativeVolume, 'volume');
            
            return (normPriceChange * 0.4 + normTurnoverRate * 0.3 + normRelativeVolume * 0.3);
        } catch (error) {
            console.error(`计算股票 ${stock.name || stock.code} 技术面评分时出错:`, error);
            return 0;
        }
    }

    /**
     * 高级多因子选股算法 - 短期上涨潜力
     * @param {number} count - 返回股票数量，默认1
     * @returns {Array} 选出的股票数组
     */
    selectStocksForShortTermGrowth(count = 1) {
        const validStocks = this.getCleanedData();
        
        // 如果没有有效股票，返回空数组
        if (validStocks.length === 0) {
            console.warn('没有找到信息齐全的股票');
            return [];
        }
        
        try {
            // 复制有效数据以避免修改
            const stocksCopy = [...validStocks];
            
            // 应用评分模型
            stocksCopy.forEach(stock => {
                stock.score = this.calculateShortTermGrowthScore(stock);
            });
            
            // 按综合评分排序
            stocksCopy.sort((a, b) => b.score - a.score);
            
            // 返回评分最高的count只股票
            return stocksCopy.slice(0, count);
        } catch (error) {
            console.error('执行短期上涨潜力选股策略时出错:', error);
            return [];
        }
    }

    /**
     * 行业分散投资选股
     * @param {number} count - 每种行业选出的股票数量
     * @returns {Array} 跨行业的股票组合
     */
    selectDiversifiedPortfolio(count = 1) {
        const validStocks = this.getCleanedData();
        
        if (validStocks.length === 0) {
            return [];
        }
        
        try {
            // 按行业分组
            const industryGroups = {};
            validStocks.forEach(stock => {
                if (!industryGroups[stock.industry]) {
                    industryGroups[stock.industry] = [];
                }
                industryGroups[stock.industry].push(stock);
            });
            
            // 从每个行业选择评分最高的股票
            const portfolio = [];
            Object.keys(industryGroups).forEach(industry => {
                const industryStocks = industryGroups[industry];
                
                // 使用技术面评分模型进行评分
                industryStocks.forEach(stock => {
                    stock.score = this.calculateTechnicalScore(stock);
                });
                
                // 排序并选择前count只股票
                industryStocks.sort((a, b) => b.score - a.score);
                portfolio.push(...industryStocks.slice(0, count));
            });
            
            // 对整个组合按评分排序
            portfolio.sort((a, b) => b.score - a.score);
            
            return portfolio;
        } catch (error) {
            console.error('执行行业分散投资选股策略时出错:', error);
            return [];
        }
    } 

    /**
     * 短期突破选股策略
     * 基于价格和成交量的三要素验证法
     * @param {number} count - 返回股票数量，默认5
     * @returns {Array} 选出的股票数组
     */
    selectStocksForBreakout(count = 5) {
        const validStocks = this.getCleanedData();
        
        if (validStocks.length === 0) {
            console.warn('没有找到信息齐全的股票');
            return [];
        }
        
        try {
            // 为了简化实现，这里假设我们只有当日数据
            // 在实际应用中，应该有历史数据来计算各种指标
            const filteredStocks = validStocks.filter(stock => {
                // 确保必要的字段存在
                if (!stock.volumeRatio || !stock.changePercent) {
                    return false;
                }
                
                // 简化实现：基于单天数据模拟三要素验证
                // 在真实场景中，应该使用历史数据计算各项指标
                
                // 要素一：价格态势 - 假设当前波动性处于低位（模拟）
                // 实际应用中应计算过去N日平均真实波幅与过去M日的比较
                const isLowVolatility = stock.turnoverRate < 5; // 简化：换手率低表示波动小
                
                // 要素二：动能确认 - 量能温和放大
                // 实际应用中应计算最近3-5日平均成交量与之前5-10日的比较
                const isVolumeIncreasing = stock.volumeRatio > 1.5; // 量比大于1.5表示量能放大
                
                // 要素二：价格重心上移（假设已实现）
                // 实际应用中应检查收盘价是否站上5日和10日均线
                const isPriceAboveMA = stock.priceChange > 0; // 简化：上涨表示重心上移
                
                // 要素三：突破信号 - 价格突破（模拟）
                // 实际应用中应检查是否突破20日最高价
                const isPriceBreakout = stock.changePercent > 2; // 简化：涨幅大于2%视为突破
                
                // 要素三：成交量剧烈放大
                // 实际应用中应检查是否达到20日均量的2倍以上
                const isVolumeBreakout = stock.volumeRatio > 2; // 量比大于2视为明显放量
                
                // 同时满足所有条件
                return isLowVolatility && isVolumeIncreasing && isPriceAboveMA && isPriceBreakout && isVolumeBreakout;
            });
            
            // 如果没有足够的股票满足所有条件，则放宽部分条件
            let resultStocks = filteredStocks;
            if (resultStocks.length < count) {
                resultStocks = validStocks.filter(stock => {
                    // 确保必要的字段存在
                    if (!stock.volumeRatio || !stock.changePercent) {
                        return false;
                    }
                    
                    // 放宽部分条件，优先选择量价配合好的股票
                    const isVolumeIncreasing = stock.volumeRatio > 1.2;
                    const isPriceAboveMA = stock.priceChange > 0;
                    const isPriceBreakout = stock.changePercent > 1;
                    const isVolumeBreakout = stock.volumeRatio > 1.5;
                    
                    return isVolumeIncreasing && isPriceAboveMA && isPriceBreakout && isVolumeBreakout;
                });
            }
            
            // 为选出的股票添加详细评分
            resultStocks.forEach(stock => {
                try {
                    // 计算突破强度评分（0-100）
                    let breakoutScore = this.calculateBreakoutScore(stock);
                    
                    stock.score = breakoutScore;
                    stock.strategy = '短期突破';
                } catch (error) {
                    console.error(`计算股票 ${stock.name || stock.code} 突破评分时出错:`, error);
                    stock.score = 0;
                    stock.strategy = '短期突破';
                }
            });
            
            // 按突破强度排序
            resultStocks.sort((a, b) => b.score - a.score);
            
            // 返回前count只股票
            return resultStocks.slice(0, count);
        } catch (error) {
            console.error('执行短期突破选股策略时出错:', error);
            return [];
        }
    }

    /**
     * 计算突破强度评分
     * @param {Object} stock - 股票数据
     * @returns {number} 突破强度评分（0-100）
     */
    calculateBreakoutScore(stock) {
        // 确保必要的字段存在
        if (!stock.volumeRatio || !stock.changePercent) {
            return 0;
        }
        
        // 计算突破强度评分（0-100）
        let breakoutScore = 0;
        
        // 量比评分（30%权重）
        const volumeScore = Math.min(stock.volumeRatio / 3, 1) * 30;
        
        // 涨幅评分（30%权重）
        const changeScore = Math.min(stock.changePercent / 5, 1) * 30;
        
        // 换手率评分（20%权重）
        const turnoverScore = Math.min(stock.turnoverRate / 10, 1) * 20;
        
        // 综合评分
        breakoutScore = volumeScore + changeScore + turnoverScore;
        
        // PE和ROE基本面加分（20%权重）
        if (stock.pe > 0 && stock.pe < 40) {
            breakoutScore += 10;
        }
        if (stock.roe > 0 && stock.roe > 10) {
            breakoutScore += 10;
        }
        
        // 确保评分在0-100之间
        return Math.max(0, Math.min(100, breakoutScore));
    }
    
    /**
     * 获取风险评估
     * @param {Object} stock - 股票数据
     * @returns {Object} 风险评估结果
     */
    getRiskAssessment(stock) {
        try {
            let riskLevel = '中等';
            let riskScore = 0;
            let riskFactors = [];
            
            // 定义风险评估规则
            const riskRules = [
                { condition: stock.pe > 50, score: 1, factor: '高PE' },
                { condition: stock.pe < 5 && stock.pe > 0, score: 0.5, factor: '异常低PE' },
                { condition: stock.pb > 5, score: 0.8, factor: '高PB' },
                { condition: Math.abs(stock.priceChange) > 10, score: 1.2, factor: '波动剧烈' },
                { condition: stock.turnoverRate > 10, score: 0.5, factor: '高换手率' },
                { condition: stock.marketCap < 50, score: 0.3, factor: '小盘股风险' },
                { condition: stock.roe < 5, score: 0.5, factor: '盈利能力较弱' }
            ];
            
            // 应用风险评估规则
            riskRules.forEach(rule => {
                if (rule.condition) {
                    riskScore += rule.score;
                    riskFactors.push(rule.factor);
                }
            });
            
            // 确定风险等级
            if (riskScore > 3) {
                riskLevel = '高风险';
            } else if (riskScore < 1.5) {
                riskLevel = '低风险';
            }
            
            return {
                level: riskLevel,
                score: riskScore,
                factors: riskFactors
            };
        } catch (error) {
            console.error(`评估股票 ${stock.name || stock.code} 风险时出错:`, error);
            return {
                level: '未知',
                score: 0,
                factors: ['评估出错']
            };
        }
    }

    /**
     * 获取短期突破选股策略的投资建议
     * @param {Object} stock - 选中的股票
     * @returns {Object} 投资建议
     */
    getInvestmentAdvice(stock) {
        try {
            const risk = this.getRiskAssessment(stock);
            
            // 生成建议
            let advice = {
                risk,
                timing: '观望',
                position: '轻仓',
                holdingPeriod: '短期',
                rationale: [],
                caution: [],
                confidence: 0.5 // 置信度（0-1）
            };
            
            // 根据风险等级调整初始建议
            if (risk.level === '高风险') {
                advice.position = '轻仓';
                advice.caution.push('股票风险等级较高，请控制仓位');
            } else if (risk.level === '低风险') {
                advice.confidence += 0.2;
            }
            
            // 短期突破策略特有建议
            if (stock.strategy === '短期突破' && stock.score) {
                // 基于突破强度评分生成建议
                if (stock.score > 80) {
                    advice.timing = '买入';
                    advice.position = '适度仓位';
                    advice.rationale.push('短期突破信号强烈，量价配合完美');
                    advice.rationale.push('预计短期上涨概率较高');
                    advice.confidence = 0.8;
                } else if (stock.score > 60) {
                    advice.timing = '关注';
                    advice.rationale.push('具备短期突破潜力');
                    advice.rationale.push('可等待回踩确认后买入');
                    advice.confidence = 0.6;
                } else {
                    advice.rationale.push('突破信号一般，建议继续观察');
                }
            } else if (stock.score) {
                // 传统评分系统（备用）
                if (stock.score > 0.8) {
                    advice.timing = '买入';
                    advice.position = '适度仓位';
                    advice.rationale.push('技术面表现强劲');
                    advice.confidence = 0.75;
                } else if (stock.score > 0.6) {
                    advice.timing = '关注';
                    advice.rationale.push('具备上涨潜力');
                    advice.confidence = 0.6;
                }
            }
            
            // 基本面指标增强判断
            if (stock.roe > 15) {
                advice.rationale.push('盈利能力强，基本面支撑');
                advice.confidence += 0.1;
            }
            
            // PE估值判断
            if (stock.pe > 0 && stock.pe < 20) {
                advice.rationale.push('估值合理，安全边际较高');
                advice.confidence += 0.05;
            }
            
            // 短期交易特有建议
            advice.holdingPeriod = '短期 (3-15天)';
            advice.rationale.push('建议在突破次日回踩支撑位时买入');
            advice.rationale.push('设置3%止损位以控制风险');
            advice.rationale.push('目标收益10%-15%，可分批止盈');
            
            // 风险提示
            advice.caution.push('短期交易波动较大，请严格执行止损');
            advice.caution.push('建议分散投资3-5只同时出现信号的股票');
            
            // 确保置信度在0-1之间
            advice.confidence = Math.max(0, Math.min(1, advice.confidence));
            
            return advice;
        } catch (error) {
            console.error(`生成股票 ${stock.name || stock.code} 投资建议时出错:`, error);
            return {
                risk: { level: '未知', score: 0, factors: [] },
                timing: '观望',
                position: '轻仓',
                holdingPeriod: '短期',
                rationale: ['生成建议时发生错误'],
                caution: ['建议谨慎决策'],
                confidence: 0.3
            };
        }
    }
}

// 导出模块
if (typeof window !== 'undefined') {
    window.StockSelector = StockSelector;
} else if (typeof module !== 'undefined') {
    module.exports = StockSelector;
}