/**
 * AppInitializer.js
 * 应用初始化器，负责协调各个模块的初始化和交互
 */

import StockSelector from '../selector.js';
import StrategyManager from '../strategy.js';
import UIManager from '../ui.js';
import StockAPI from '../api.js';
import mockData from '../utils/mockData.js';

// 应用配置
const appConfig = {
    apiBaseUrl: '/api',
    debug: true,
    dataSource: 'mock' // 'mock' or 'api'
};

/**
 * AppInitializer类 - 负责初始化整个应用程序
 */
class AppInitializer {
    constructor() {
        this.api = new StockAPI(appConfig.apiBaseUrl);
        this.uiManager = new UIManager();
        this.strategyManager = new StrategyManager();
        this.stockSelector = new StockSelector();
        this.currentStrategy = 'composite';
        this.strategyParams = {
            composite: { topN: 10, weights: { pe: 0.3, pb: 0.2, roe: 0.5 } },
            value: { peMax: 15, pbMax: 2, roeMin: 15, topN: 10 },
            growth: { growthMin: 20, topN: 10 },
            industry: { industry: '科技', topN: 5 },
            breakout: { volumeThreshold: 1.5, days: 3, topN: 10 },
            lowValuation: { pePercentile: 20, pbPercentile: 20, topN: 10 },
            momentum: { period: 60, topN: 10 }
        };
        
        // 将StockSelector实例设置到StrategyManager中
        this.strategyManager.setStockSelector(this.stockSelector);
    }

    /**
     * 初始化应用程序
     */
    init() {
        try {
            this.loadMockData();
            this.bindEvents();
            this.updateStrategyParamsUI(); // 使用updateStrategyParamsUI代替不存在的renderUI
            
            if (appConfig.debug) {
                console.log('App initialized successfully with mock data');
                console.log('Available strategies:', this.strategyManager.getAvailableStrategies());
                console.log('Initial stock data count:', this.stockSelector.getStockData().length);
            }
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.uiManager.showNotification('应用初始化失败', 'error');
        }
    }

    /**
     * 加载模拟数据
     */
    loadMockData() {
        try {
            // 使用导入的模拟数据
            this.stockSelector.setStockData(mockData);
            this.uiManager.showNotification('模拟数据加载成功', 'success');
        } catch (error) {
            console.error('Failed to load mock data:', error);
            this.uiManager.showNotification('模拟数据加载失败', 'error');
        }
    }

    /**
     * 绑定UI事件
     */
    bindEvents() {
        // 绑定选股按钮点击事件
        document.getElementById('select-stocks-btn')?.addEventListener('click', () => {
            this.performStockSelection();
        });

        // 绑定策略选择变化事件
        document.getElementById('strategy-select')?.addEventListener('change', (e) => {
            this.onStrategyChange(e.target.value);
        });
    }

    /**
 * 当策略改变时调用
 */
onStrategyChange(strategyId) {
    if (this.strategyManager.getStrategy(strategyId) !== null) {
        this.currentStrategy = strategyId;
        this.updateStrategyParamsUI();
        this.uiManager.showNotification(`已切换到${strategyId}策略`, 'info');
    } else {
        this.uiManager.showNotification('无效的策略选择', 'error');
    }
}

    /**
     * 更新策略参数UI
     */
    updateStrategyParamsUI() {
        const paramsContainer = document.getElementById('strategy-params');
        if (!paramsContainer) return;

        paramsContainer.innerHTML = '';
        const params = this.strategyParams[this.currentStrategy];

        if (params) {
            for (const key in params) {
                if (key !== 'topN') {
                    const paramDiv = document.createElement('div');
                    paramDiv.className = 'param-input-group';
                    paramDiv.innerHTML = `
                        <label for="param-${key}">${this.getParamDisplayName(key)}:</label>
                        ${this.createParamInput(key, params[key])}
                    `;
                    paramsContainer.appendChild(paramDiv);
                }
            }
        }
    }

    /**
     * 获取参数显示名称
     */
    getParamDisplayName(key) {
        const displayNames = {
            weights: '权重设置',
            peMax: 'PE最大值',
            pbMax: 'PB最大值',
            roeMin: 'ROE最小值',
            growthMin: '增长率最小值',
            industry: '行业',
            volumeThreshold: '成交量阈值',
            days: '突破天数',
            pePercentile: 'PE百分位',
            pbPercentile: 'PB百分位',
            period: '动量周期'
        };
        return displayNames[key] || key;
    }

    /**
     * 创建参数输入框
     */
    createParamInput(key, value) {
        if (typeof value === 'object' && value !== null) {
            let html = '<div class="weight-inputs">';
            for (const subKey in value) {
                html += `
                    <div class="sub-param">
                        <label>${this.getWeightDisplayName(subKey)}:</label>
                        <input type="number" id="param-${key}-${subKey}" value="${value[subKey]}" step="0.1" min="0" max="1">
                    </div>
                `;
            }
            html += '</div>';
            return html;
        } else if (key === 'industry') {
            // 行业选择下拉框
            const industries = ['银行', '酿酒', '新能源', '互联网', '医药生物', '科技', '汽车', '房地产', '食品饮料', '化工'];
            let html = '<select id="param-industry">';
            industries.forEach(industry => {
                const selected = industry === value ? 'selected' : '';
                html += `<option value="${industry}" ${selected}>${industry}</option>`;
            });
            html += '</select>';
            return html;
        }
        return `<input type="number" id="param-${key}" value="${value}" step="0.1">`;
    }

    /**
     * 获取权重显示名称
     */
    getWeightDisplayName(key) {
        const displayNames = {
            pe: 'PE权重',
            pb: 'PB权重',
            roe: 'ROE权重'
        };
        return displayNames[key] || key;
    }

    /**
     * 执行选股操作
     */
    async performStockSelection() {
        try {
            const strategy = this.getActiveStrategy();
            const params = this.getStrategyParams();
            
            if (appConfig.debug) {
                console.log(`Executing strategy: ${strategy} with params:`, params);
            }

            // 正确处理Promise返回值
            const result = await this.strategyManager.executeStrategy(strategy, params);
            
            if (result.success && result.data && result.data.length > 0) {
                this.uiManager.updateStockTable(result.data);
                this.uiManager.showNotification(`成功选出${result.data.length}支股票`, 'success');
            } else {
                this.uiManager.updateStockTable([]);
                this.uiManager.showNotification(result.error || '没有找到符合条件的股票', 'warning');
            }
        } catch (error) {
            console.error('Failed to perform stock selection:', error);
            this.uiManager.updateStockTable([]);
            this.uiManager.showNotification('选股过程中发生错误', 'error');
        }
    }

    /**
     * 获取当前激活的策略
     */
    getActiveStrategy() {
        return this.currentStrategy;
    }

    /**
     * 获取当前策略的参数
     */
    getStrategyParams() {
        const params = { ...this.strategyParams[this.currentStrategy] };
        
        // 从UI中获取参数值
        for (const key in params) {
            if (key !== 'weights' && document.getElementById(`param-${key}`)) {
                const input = document.getElementById(`param-${key}`);
                if (input.type === 'number') {
                    params[key] = parseFloat(input.value) || params[key];
                } else {
                    params[key] = input.value || params[key];
                }
            }
        }
        
        // 处理权重参数
        if (params.weights) {
            for (const weightKey in params.weights) {
                const weightInput = document.getElementById(`param-weights-${weightKey}`);
                if (weightInput) {
                    params.weights[weightKey] = parseFloat(weightInput.value) || params.weights[weightKey];
                }
            }
        }
        
        return params;
    }
}

export default AppInitializer;