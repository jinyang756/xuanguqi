/**
 * tushare_api.js - 前端集成tushare API的工具类
 * 提供股票数据获取和处理功能
 * 优化版：支持高级选股器模块
 */

class TushareAPI {
    constructor() {
        // API基础配置
        this.baseUrl = ''; // 未来可以配置为后端API地址
        this.isDebug = false;
        
        // 缓存机制优化
        this.cacheTimeout = 15 * 60 * 1000; // 缓存15分钟
        this.lastCacheTimestamp = null;
        
        // 初始化缓存统计
        this.cacheStats = {
            hits: 0,
            misses: 0,
            totalRequests: 0
        };
    }
    
    /**
     * 从localStorage加载股票数据
     * 优化版：增强缓存统计和错误恢复能力
     * @param {boolean} allowExpired - 是否允许使用过期缓存
     * @returns {Array|null} 缓存的股票数据或null
     */
    loadStockDataFromLocal(allowExpired = false) {
        try {
            const storedData = localStorage.getItem('stockDataCache');
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                
                // 验证缓存数据完整性
                if (!this.validateCacheData(parsedData)) {
                    throw new Error('缓存数据格式无效');
                }
                
                // 检查缓存是否过期
                const isExpired = Date.now() - parsedData.timestamp >= this.cacheTimeout;
                if (!isExpired || allowExpired) {
                    if (this.isDebug) {
                        const status = isExpired ? '过期' : '有效';
                        console.log(`从本地缓存加载数据${status}，缓存时间:`, new Date(parsedData.timestamp).toLocaleString());
                    }
                    this.cacheStats.hits++;
                    this.cacheStats.totalRequests++;
                    return parsedData.data;
                } else {
                    if (this.isDebug) {
                        console.log('本地缓存已过期，将重新加载数据');
                    }
                }
            }
        } catch (error) {
            console.error('加载本地缓存失败:', error);
            // 清理损坏的缓存
            try {
                localStorage.removeItem('stockDataCache');
            } catch (e) {}
        }
        this.cacheStats.misses++;
        this.cacheStats.totalRequests++;
        return null;
    }

    /**
     * 验证缓存数据格式是否有效
     * @param {Object} cacheData - 缓存数据
     * @returns {boolean} 数据是否有效
     * @private
     */
    validateCacheData(cacheData) {
        return cacheData && 
               cacheData.data && 
               Array.isArray(cacheData.data) && 
               typeof cacheData.timestamp === 'number';
    }

    /**
     * 获取缓存统计信息
     * @returns {Object} 缓存统计数据
     */
    getCacheStatistics() {
        const hitRate = this.cacheStats.totalRequests > 0 
            ? Math.round((this.cacheStats.hits / this.cacheStats.totalRequests) * 100) 
            : 0;
            
        return {
            ...this.cacheStats,
            hitRate: `${hitRate}%`
        };
    }
    
    /**
     * 将股票数据保存到localStorage
     * 优化版：添加数据验证
     */
    saveStockDataToLocal(data) {
        try {
            if (!Array.isArray(data) || data.length === 0) {
                console.warn('尝试保存无效数据到缓存');
                return;
            }
            
            const cacheData = {
                data: data,
                timestamp: Date.now(),
                version: '1.1' // 添加版本标记以便未来升级
            };
            localStorage.setItem('stockDataCache', JSON.stringify(cacheData));
            this.lastCacheTimestamp = Date.now();
            
            if (this.isDebug) {
                console.log('数据已成功保存到本地缓存');
            }
        } catch (error) {
            console.error('保存到本地缓存失败:', error);
        }
    }
    
    /**
     * 验证股票数据完整性
     */
    validateStockData(stock) {
        if (!stock || typeof stock !== 'object') return false;
        
        // 基本字段验证
        const requiredFields = ['code', 'name', 'price', 'changePercent'];
        return requiredFields.every(field => stock[field] !== undefined && stock[field] !== null);
    }
    
    /**
     * 清理和规范化股票数据
     * @param {Array} rawData - 原始股票数据
     * @returns {Array} 清理后的股票数据
     */
    cleanStockData(rawData) {
        if (!Array.isArray(rawData)) {
            return [];
        }
        
        return rawData
            .filter(stock => this.validateStockData(stock))
            .map(stock => ({
                ...stock,
                // 确保数值类型正确
                price: parseFloat(stock.price) || 0,
                changePercent: parseFloat(stock.changePercent) || 0,
                pe: parseFloat(stock.pe) || 0,
                pb: parseFloat(stock.pb) || 0,
                roe: parseFloat(stock.roe) || 0,
                turnoverRate: parseFloat(stock.turnoverRate) || 0,
                volumeRatio: parseFloat(stock.volumeRatio) || 0,
                marketCap: parseFloat(stock.marketCap) || 0,
                // 处理可能的空值
                industry: stock.industry || '未分类',
                sector: stock.sector || '未分类'
            }));
    }
    
    /**
     * 从JSON文件加载股票数据
     * 优化版：添加数据清洗和错误重试
     * @returns {Promise<Array>} 清理后的股票数据数组
     */
    async loadStockDataFromJSON() {
        const maxRetries = 2;
        let retryCount = 0;
        
        while (retryCount < maxRetries) {
            try {
                // 动态获取数据路径（假设脚本在src目录，数据在src同级的data目录）
                const basePath = window.location.pathname.includes('src')
                    ? '../data/processed/stock_data.json'
                    : 'data/processed/stock_data.json';
                
                // 从本地JSON文件加载数据
                const response = await fetch(basePath, {
                    cache: 'no-cache' // 避免浏览器过度缓存
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP错误! 状态码: ${response.status}`);
                }
                
                const data = await response.json();
                
                // 清理和验证数据
                const cleanedData = this.cleanStockData(data);
                
                // 只保存有效数据到缓存
                if (cleanedData.length > 0) {
                    this.saveStockDataToLocal(cleanedData);
                }
                
                if (this.isDebug) {
                    console.log(`成功加载${cleanedData.length}条股票数据`);
                }
                
                return cleanedData;
            } catch (error) {
                retryCount++;
                
                if (retryCount >= maxRetries) {
                    console.error('加载股票数据JSON文件失败（已重试）:', error);
                    // 返回缓存数据作为后备
                    const cachedData = this.loadStockDataFromLocal() || [];
                    if (this.isDebug && cachedData.length > 0) {
                        console.log(`使用后备缓存数据，共${cachedData.length}条`);
                    }
                    return cachedData;
                }
                
                // 重试前等待一小段时间
                await new Promise(resolve => setTimeout(resolve, 300 * retryCount));
            }
        }
        
        return [];
    }
    
    /**
     * 获取热门股票列表
     * 优化版：添加成交量和换手率因素
     * @param {number} count - 要获取的股票数量
     * @returns {Promise<Array>} 热门股票列表
     */
    async getHotStocks(count = 10) {
        try {
            const stockData = await this.loadStockDataFromJSON();
            
            // 多因素排序：涨跌幅(50%)、换手率(30%)、成交量(20%)
            return stockData
                .map(stock => ({
                    ...stock,
                    hotScore: 
                        Math.abs(stock.changePercent) * 0.5 + 
                        (stock.turnoverRate || 0) * 0.3 + 
                        (stock.volumeRatio || 0) * 0.2
                }))
                .sort((a, b) => b.hotScore - a.hotScore)
                .slice(0, count)
                .map(stock => {
                    // 移除临时评分字段
                    const { hotScore, ...rest } = stock;
                    return rest;
                });
        } catch (error) {
            console.error('获取热门股票失败:', error);
            return [];
        }
    }
    
    /**
     * 获取特定行业的股票
     * 优化版：添加行业内排序
     * @param {string} industry - 行业名称
     * @param {number} count - 返回的最大数量
     * @returns {Promise<Array>} 排序后的行业股票列表
     */
    async getStocksByIndustry(industry, count = 50) {
        try {
            const stockData = await this.loadStockDataFromJSON();
            
            return stockData
                .filter(stock => stock.industry && 
                                stock.industry.toLowerCase().includes(industry.toLowerCase()))
                .sort((a, b) => b.changePercent - a.changePercent) // 按涨幅排序
                .slice(0, count);
        } catch (error) {
            console.error(`获取${industry}行业股票失败:`, error);
            return [];
        }
    }
    
    /**
     * 获取行业分布统计
     * @returns {Promise<Object>} 行业分布数据
     */
    async getIndustryDistribution() {
        try {
            const stockData = await this.loadStockDataFromJSON();
            const distribution = {};
            
            stockData.forEach(stock => {
                const industry = stock.industry || '未分类';
                distribution[industry] = (distribution[industry] || 0) + 1;
            });
            
            // 转换为数组并排序
            return Object.entries(distribution)
                .map(([industry, count]) => ({ industry, count }))
                .sort((a, b) => b.count - a.count);
        } catch (error) {
            console.error('获取行业分布失败:', error);
            return [];
        }
    }
    
    /**
     * 刷新股票数据（模拟调用Python脚本）
     * 优化版：添加回调支持
     * @param {Function} onSuccess - 成功回调
     * @param {Function} onError - 错误回调
     * @returns {Promise<boolean>} 是否刷新成功
     */
    async refreshStockData(onSuccess = null, onError = null) {
        try {
            // 显示加载提示
            if (window.showLoadingAnimation) {
                window.showLoadingAnimation('正在更新股票数据...');
            }
            
            // 这里可以通过后端API调用Python脚本
            // 由于浏览器安全限制，前端无法直接执行本地Python脚本
            // 实际应用中应该通过后端服务实现
            
            console.log('提示：在实际环境中，这里会调用后端API来执行tushare_integration.py脚本更新数据');
            
            // 模拟数据更新
            return new Promise(resolve => {
                setTimeout(() => {
                    try {
                        // 清除缓存，强制重新加载
                        localStorage.removeItem('stockDataCache');
                        
                        // 隐藏加载提示
                        if (window.hideLoadingAnimation) {
                            window.hideLoadingAnimation();
                        }
                        
                        // 调用成功回调
                        if (typeof onSuccess === 'function') {
                            onSuccess();
                        } else {
                            // 显示更新成功提示
                            alert('股票数据已更新！请刷新页面查看最新数据。');
                        }
                        
                        resolve(true);
                    } catch (err) {
                        if (typeof onError === 'function') {
                            onError(err);
                        } else {
                            alert('更新数据时发生错误');
                        }
                        resolve(false);
                    }
                }, 2000);
            });
        } catch (error) {
            console.error('刷新股票数据失败:', error);
            
            // 隐藏加载提示
            if (window.hideLoadingAnimation) {
                window.hideLoadingAnimation();
            }
            
            if (typeof onError === 'function') {
                onError(error);
            }
            
            return false;
        }
    }
    
    /**
     * 格式化股票代码显示
     * @param {string} code - 股票代码
     * @returns {string} 格式化后的股票代码
     */
    formatStockCode(code) {
        if (!code) return '';
        
        // 处理不同市场的股票代码格式
        if (code.includes('.')) {
            const parts = code.split('.');
            const market = parts[1];
            const symbol = parts[0];
            
            let marketName = '';
            switch (market) {
                case 'SH':
                    marketName = '沪';
                    break;
                case 'SZ':
                    marketName = '深';
                    break;
                case 'BJ':
                    marketName = '京';
                    break;
            }
            
            return `${symbol}(${marketName})`;
        }
        
        return code;
    }
    
    /**
     * 显示股票详情卡片
     * 优化版：支持自定义样式和动画
     * @param {Object} stock - 股票数据
     * @param {Object} options - 配置选项
     */
    showStockDetail(stock, options = {}) {
        if (!stock) return;
        
        try {
            // 默认选项
            const defaultOptions = {
                position: 'right', // 'right' 或 'center'
                duration: 300, // 动画持续时间
                showClose: true, // 是否显示关闭按钮
                highlightFields: ['price', 'changePercent'] // 需要高亮显示的字段
            };
            
            const config = { ...defaultOptions, ...options };
            
            // 查找或创建结果容器
            let resultContainer = document.getElementById('resultContainer');
            if (!resultContainer) {
                // 如果没有结果容器，创建一个
                resultContainer = document.createElement('div');
                resultContainer.id = 'resultContainer';
                resultContainer.className = 'result-container';
                resultContainer.style.position = 'fixed';
                resultContainer.style.zIndex = '1000';
                resultContainer.style.display = 'flex';
                resultContainer.style.flexDirection = 'column';
                resultContainer.style.gap = '10px';
                
                if (config.position === 'center') {
                    resultContainer.style.top = '50%';
                    resultContainer.style.left = '50%';
                    resultContainer.style.transform = 'translate(-50%, -50%)';
                } else {
                    resultContainer.style.top = '20px';
                    resultContainer.style.right = '20px';
                }
                
                document.body.appendChild(resultContainer);
            }
            
            // 创建股票详情卡片
            const card = document.createElement('div');
            card.className = 'stock-detail-card';
            
            // 添加初始样式以支持动画
            card.style.transform = config.position === 'center' ? 'translate(-50%, -50%) scale(0.8)' : 'translateX(100%)';
            card.style.opacity = '0';
            card.style.transition = `transform ${config.duration}ms ease-out, opacity ${config.duration}ms ease-out`;
            
            // 构建卡片内容
            let closeButton = config.showClose ? 
                '<button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>' : '';
            
            // 构建指标网格
            let metricsHtml = '';
            const metrics = [
                { label: '市盈率(PE)', value: stock.pe },
                { label: '市净率(PB)', value: stock.pb },
                { label: 'ROE', value: `${stock.roe || 0}%` },
                { label: '换手率', value: `${stock.turnoverRate || 0}%` },
                { label: '行业', value: stock.industry || '未分类' },
                { label: '市值', value: `${stock.marketCap || 0}亿` }
            ];
            
            metrics.forEach(metric => {
                metricsHtml += `
                    <div class="metric-item">
                        <span class="metric-label">${metric.label}</span>
                        <span class="metric-value">${metric.value}</span>
                    </div>
                `;
            });
            
            // 添加投资建议（如果有）
            let adviceHtml = '';
            if (stock.advice) {
                adviceHtml = `
                    <div class="advice-section">
                        <h4>投资建议</h4>
                        <p>${stock.advice}</p>
                    </div>
                `;
            }
            
            card.innerHTML = `
                <div class="card-header">
                    <h3>${stock.name}</h3>
                    <span class="stock-code">${this.formatStockCode(stock.code)}</span>
                    ${closeButton}
                </div>
                <div class="card-body">
                    <div class="price-section">
                        <span class="current-price">¥${stock.price}</span>
                        <span class="price-change ${stock.changePercent >= 0 ? 'up' : 'down'}">
                            ${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent}%
                        </span>
                    </div>
                    <div class="metrics-grid">
                        ${metricsHtml}
                    </div>
                    ${adviceHtml}
                </div>
            `;
            
            // 添加卡片样式
            const style = document.createElement('style');
            style.textContent = `
                .stock-detail-card {
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 10px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    padding: 15px;
                    min-width: 300px;
                    backdrop-filter: blur(10px);
                }
                .card-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }
                .card-header h3 {
                    margin: 0;
                    font-size: 18px;
                    color: #333;
                }
                .stock-code {
                    font-size: 14px;
                    color: #666;
                    margin-left: 10px;
                }
                .close-btn {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #999;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                }
                .close-btn:hover {
                    background: #f5f5f5;
                    color: #333;
                }
                .price-section {
                    display: flex;
                    align-items: baseline;
                    margin-bottom: 15px;
                }
                .current-price {
                    font-size: 28px;
                    font-weight: bold;
                    color: #333;
                    margin-right: 10px;
                }
                .price-change {
                    font-size: 20px;
                    font-weight: bold;
                }
                .price-change.up {
                    color: #e34234;
                }
                .price-change.down {
                    color: #2b73b7;
                }
                .metrics-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }
                .metric-item {
                    display: flex;
                    justify-content: space-between;
                }
                .metric-label {
                    font-size: 14px;
                    color: #666;
                }
                .metric-value {
                    font-size: 14px;
                    color: #333;
                    font-weight: 500;
                }
                .advice-section {
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 1px solid #eee;
                }
                .advice-section h4 {
                    margin: 0 0 8px 0;
                    font-size: 16px;
                    color: #333;
                }
                .advice-section p {
                    margin: 0;
                    font-size: 14px;
                    color: #666;
                    line-height: 1.5;
                }
            `;
            document.head.appendChild(style);
            
            // 添加卡片到容器
            resultContainer.appendChild(card);
            
            // 触发动画
            setTimeout(() => {
                card.style.transform = config.position === 'center' ? 'translate(-50%, -50%) scale(1)' : 'translateX(0)';
                card.style.opacity = '1';
            }, 10);
        } catch (error) {
            console.error('显示股票详情失败:', error);
            // 避免频繁弹出alert
            if (console && console.warn) {
                console.warn(`显示股票详情失败: ${error.message}`);
            }
        }
    }
    
    /**
     * 检查API是否可用
     * @returns {boolean} API是否可用
     */
    isAvailable() {
        // 简单实现：如果有baseUrl配置，则认为API可用
        // 实际项目中可以添加更复杂的健康检查逻辑
        return this.baseUrl !== '';
    }
    
    /**
     * 模拟加载最新股票数据
     * @returns {Promise<Array|null>} 股票数据数组或null
     */
    async loadLatestStockData() {
        // 在实际项目中，这里应该是真正的API调用
        console.log('模拟加载Tushare API数据');
        
        // 返回本地JSON数据作为替代
        try {
            const data = await this.loadStockDataFromJSON();
            return data.length > 0 ? data : null;
        } catch (error) {
            console.error('加载数据失败:', error);
            return null;
        }
    }

    /**
     * 清理指定类型的缓存
     * @param {string} cacheType - 缓存类型 ('all', 'stockData', 'industry')
     */
    clearSpecificCache(cacheType = 'all') {
        try {
            if (cacheType === 'all' || cacheType === 'stockData') {
                localStorage.removeItem('stockDataCache');
                if (this.isDebug) {
                    console.log('已清除股票数据缓存');
                }
            }
            
            // 可以根据需要扩展更多类型的缓存清理
        } catch (error) {
            console.error('清理缓存失败:', error);
        }
    }

    /**
     * 管理缓存大小，删除旧缓存
     * @param {number} maxSize - 最大缓存条目数
     */
    manageCacheSize(maxSize = 1000) {
        try {
            // 检查所有缓存项，根据需要删除旧项
            // 这是一个简单实现，实际项目中可以根据更复杂的策略
            if (this.isDebug) {
                console.log(`执行缓存大小管理，最大允许${maxSize}条`);
            }
            
            // 例如：可以检查缓存数据大小，如果超过阈值则清理部分数据
            const stockData = this.loadStockDataFromLocal(true);
            if (stockData && stockData.length > maxSize) {
                // 保留最近的maxSize条记录
                const trimmedData = stockData.slice(0, maxSize);
                this.saveStockDataToLocal(trimmedData);
                if (this.isDebug) {
                    console.log(`缓存已裁剪至${maxSize}条记录`);
                }
            }
        } catch (error) {
            console.error('管理缓存大小失败:', error);
        }
    }
}

// 初始化TushareAPI实例
window.tushareAPI = new TushareAPI();

/**
 * 添加股票搜索功能到选股器（已移除）
 */
function initStockSearchFeature() {
    // 已移除股票搜索功能的相关元素
}

// 创建TushareAPI的实例并添加isAvailable方法
window.TushareAPI = new TushareAPI();
window.TushareAPI.isAvailable = function() {
    // 简单实现：如果有baseUrl配置，则认为API可用
    return this.baseUrl !== '';
};
window.TushareAPI.loadLatestStockData = function() {
    // 模拟加载最新股票数据的Promise
    return new Promise((resolve, reject) => {
        // 实际项目中这里应该是API调用
        setTimeout(() => {
            console.log('模拟加载Tushare API数据失败，将使用本地数据');
            resolve(null); // 返回null表示API不可用或加载失败
        }, 1000);
    });
};

// 同时保留原始类，方便需要时创建新实例
window.TushareAPIClass = TushareAPI;
window.initStockSearchFeature = initStockSearchFeature;