/**
 * mockData.js
 * 提供模拟股票数据，用于在没有后端API的情况下测试和演示
 */

/**
 * 生成模拟股票数据
 * @param {number} count - 生成的股票数量
 * @returns {Array} 模拟股票数据数组
 */
export function generateMockStockData(count = 100) {
    const industries = ['银行', '酿酒', '新能源', '互联网', '医药生物', '科技', '汽车', '房地产', '食品饮料', '化工'];
    const stocks = [];
    
    for (let i = 1; i <= count; i++) {
        const industry = industries[Math.floor(Math.random() * industries.length)];
        const basePrice = getBasePriceByIndustry(industry);
        const volatility = getVolatilityByIndustry(industry);
        const price = parseFloat((basePrice * (1 + (Math.random() - 0.5) * volatility)).toFixed(2));
        const changePercent = parseFloat(((Math.random() - 0.5) * 5).toFixed(2));
        
        // 根据行业特性调整财务指标
        let pe, pb, roe, market_cap;
        if (industry === '银行') {
            pe = parseFloat((3 + Math.random() * 7).toFixed(2)); // 银行PE较低
            pb = parseFloat((0.5 + Math.random() * 0.8).toFixed(2)); // 银行PB较低
            roe = parseFloat((10 + Math.random() * 10).toFixed(2));
            market_cap = 100000000000 + Math.random() * 4000000000000; // 银行市值较大
        } else if (industry === '酿酒') {
            pe = parseFloat((15 + Math.random() * 30).toFixed(2));
            pb = parseFloat((3 + Math.random() * 10).toFixed(2));
            roe = parseFloat((15 + Math.random() * 20).toFixed(2));
            market_cap = 100000000000 + Math.random() * 3000000000000;
        } else if (industry === '新能源') {
            pe = parseFloat((20 + Math.random() * 40).toFixed(2));
            pb = parseFloat((3 + Math.random() * 10).toFixed(2));
            roe = parseFloat((10 + Math.random() * 20).toFixed(2));
            market_cap = 50000000000 + Math.random() * 2000000000000;
        } else if (industry === '互联网') {
            pe = parseFloat((15 + Math.random() * 30).toFixed(2));
            pb = parseFloat((2 + Math.random() * 8).toFixed(2));
            roe = parseFloat((15 + Math.random() * 25).toFixed(2));
            market_cap = 100000000000 + Math.random() * 4000000000000;
        } else {
            pe = parseFloat((10 + Math.random() * 40).toFixed(2));
            pb = parseFloat((1 + Math.random() * 8).toFixed(2));
            roe = parseFloat((5 + Math.random() * 25).toFixed(2));
            market_cap = 10000000000 + Math.random() * 500000000000;
        }
        
        const volume = Math.floor(1000000 + Math.random() * 500000000);
        
        stocks.push({
            stock_code: `000${String(i).padStart(3, '0')}`,
            stock_name: generateRandomStockName(industry),
            industry: industry,
            close_price: price,
            change_percent: changePercent,
            pe: pe,
            pb: pb,
            roe: roe,
            market_cap: market_cap,
            volume: volume,
            // 为了支持各种策略，添加更多字段
            total_assets: 1000000000 + Math.random() * 9000000000,
            net_profit: 100000000 + Math.random() * 900000000,
            revenue: 500000000 + Math.random() * 5000000000,
            growth_rate: parseFloat((Math.random() * 50 - 10).toFixed(2)), // 增长范围 -10% 到 40%
            dividend_rate: parseFloat((Math.random() * 10).toFixed(2)),
            debt_ratio: parseFloat((Math.random() * 80).toFixed(2)), // 负债比例 0-80%
            // 动量指标相关
            ma5: parseFloat((price * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2)),
            ma10: parseFloat((price * (1 + (Math.random() - 0.5) * 0.1)).toFixed(2)),
            ma20: parseFloat((price * (1 + (Math.random() - 0.5) * 0.15)).toFixed(2)),
            ma60: parseFloat((price * (1 + (Math.random() - 0.5) * 0.3)).toFixed(2)),
            // 技术指标
            rsi: parseFloat((20 + Math.random() * 60).toFixed(2)), // RSI在20-80之间
            macd: parseFloat((-2 + Math.random() * 4).toFixed(2)),
            bollinger_band: parseFloat((price * (1 + (Math.random() - 0.5) * 0.2)).toFixed(2))
        });
    }
    
    return stocks;
}

/**
 * 根据行业获取基础价格范围
 */
function getBasePriceByIndustry(industry) {
    const priceMap = {
        '银行': 15,           // 银行股价格较低
        '酿酒': 200,          // 酿酒股价格较高
        '新能源': 100,        // 新能源股价格中等偏上
        '互联网': 150,        // 互联网股价格中等偏上
        '医药生物': 80,       // 医药股价格中等
        '科技': 120,          // 科技股价格中等偏上
        '汽车': 50,           // 汽车股价格中等
        '房地产': 15,         // 房地产股价格较低
        '食品饮料': 60,       // 食品饮料股价格中等
        '化工': 30            // 化工股价格较低
    };
    
    return priceMap[industry] || 50; // 默认价格
}

/**
 * 根据行业获取波动率
 */
function getVolatilityByIndustry(industry) {
    const volatilityMap = {
        '银行': 0.2,          // 银行股波动率较低
        '酿酒': 0.3,          // 酿酒股波动率中等
        '新能源': 0.5,        // 新能源股波动率较高
        '互联网': 0.45,       // 互联网股波动率较高
        '医药生物': 0.4,      // 医药股波动率中等偏上
        '科技': 0.55,         // 科技股波动率高
        '汽车': 0.35,         // 汽车股波动率中等
        '房地产': 0.25,       // 房地产股波动率较低
        '食品饮料': 0.3,      // 食品饮料股波动率中等
        '化工': 0.35          // 化工股波动率中等
    };
    
    return volatilityMap[industry] || 0.35; // 默认波动率
}

/**
 * 生成随机股票名称
 */
function generateRandomStockName(industry) {
    // 基于行业的随机股票名称生成
    const nameComponents = {
        '银行': ['中国', '工商', '建设', '农业', '交通', '招商', '民生', '平安', '兴业', '浦发'],
        '酿酒': ['贵州', '茅台', '五粮液', '泸州', '汾酒', '洋河', '古井', '水井', '舍得', '酒鬼'],
        '新能源': ['宁德', '隆基', '阳光', '通威', '天齐', '赣锋', '亿纬', '先导', '恩捷', '容百'],
        '互联网': ['腾讯', '阿里', '京东', '美团', '拼多多', '网易', '百度', '小米', '快手', '字节'],
        '医药生物': ['恒瑞', '药明', '智飞', '复星', '云南', '片仔', '长春', '通化', '华东', '科伦'],
        '科技': ['中芯', '海康', '立讯', '宁德', '隆基', '汇川', '韦尔', '北方', '紫光', '三安'],
        '汽车': ['比亚迪', '宁德', '长城', '吉利', '长安', '广汽', '上汽', '北汽', '蔚来', '小鹏'],
        '房地产': ['万科', '保利', '招商', '融创', '碧桂园', '绿地', '龙湖', '华润', '中海', '金地'],
        '食品饮料': ['伊利', '蒙牛', '双汇', '海天', '农夫', '茅台', '五粮液', '青岛', '伊利', '光明'],
        '化工': ['万华', '恒力', '荣盛', '恒逸', '桐昆', '金发', '华鲁', '新洋丰', '盐湖', '云天化']
    };
    
    const components = nameComponents[industry] || ['科技', '创新', '发展', '未来', '时代', '数字', '智能', '绿色', '环保', '健康'];
    const nameCount = 1 + Math.floor(Math.random() * 2); // 1或2个名字组成
    const stockNameParts = [];
    
    for (let i = 0; i < nameCount; i++) {
        const randomIndex = Math.floor(Math.random() * components.length);
        stockNameParts.push(components[randomIndex]);
    }
    
    return stockNameParts.join('');
}

/**
 * 获取指定行业的模拟股票数据
 * @param {string} industry - 行业名称
 * @param {number} count - 返回的股票数量
 * @returns {Array} 特定行业的模拟股票数据
 */
export function getIndustryMockData(industry, count = 10) {
    const allStocks = generateMockStockData(count * 3); // 生成足够多的股票
    const industryStocks = allStocks.filter(stock => stock.industry === industry);
    
    // 如果符合条件的股票不足，生成特定行业的股票
    if (industryStocks.length < count) {
        const additionalStocks = [];
        const neededCount = count - industryStocks.length;
        
        for (let i = 0; i < neededCount; i++) {
            const basePrice = getBasePriceByIndustry(industry);
            const volatility = getVolatilityByIndustry(industry);
            const price = parseFloat((basePrice * (1 + (Math.random() - 0.5) * volatility)).toFixed(2));
            const changePercent = parseFloat(((Math.random() - 0.5) * 5).toFixed(2));
            
            additionalStocks.push({
                stock_code: `IND${industry.substring(0, 2)}${String(i).padStart(2, '0')}`,
                stock_name: generateRandomStockName(industry),
                industry: industry,
                close_price: price,
                change_percent: changePercent,
                pe: parseFloat((10 + Math.random() * 40).toFixed(2)),
                pb: parseFloat((1 + Math.random() * 8).toFixed(2)),
                roe: parseFloat((5 + Math.random() * 25).toFixed(2)),
                market_cap: 10000000000 + Math.random() * 500000000000,
                volume: Math.floor(1000000 + Math.random() * 500000000)
            });
        }
        
        return [...industryStocks, ...additionalStocks].slice(0, count);
    }
    
    return industryStocks.slice(0, count);
}

/**
 * 获取特定财务指标范围内的股票
 * @param {Object} filters - 过滤条件
 * @returns {Array} 符合条件的股票数据
 */
export function getFilteredMockData(filters) {
    const allStocks = generateMockStockData(200); // 生成足够多的股票用于筛选
    
    return allStocks.filter(stock => {
        // 根据传入的过滤条件筛选股票
        for (const key in filters) {
            if (filters.hasOwnProperty(key)) {
                const filter = filters[key];
                if (typeof filter === 'object' && filter !== null) {
                    // 范围过滤 { min: x, max: y }
                    if (filter.min !== undefined && stock[key] < filter.min) {
                        return false;
                    }
                    if (filter.max !== undefined && stock[key] > filter.max) {
                        return false;
                    }
                } else if (stock[key] !== filter) {
                    // 精确值过滤
                    return false;
                }
            }
        }
        return true;
    });
}

/**
 * 获取行业分布数据
 * @returns {Object} 行业名称到股票数量的映射
 */
export function getIndustryDistributionData() {
    const stocks = generateMockStockData(100);
    const distribution = {};
    
    stocks.forEach(stock => {
        if (!distribution[stock.industry]) {
            distribution[stock.industry] = 0;
        }
        distribution[stock.industry]++;
    });
    
    return distribution;
}

/**
 * 默认导出 - 生成一组示例股票数据
 */
export default generateMockStockData(50);