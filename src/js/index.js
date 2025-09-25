/**
 * index.js - 前端模块化入口文件
 * 整合所有JavaScript模块，提供统一的API接口
 */

// 导入配置
const appConfig = {
    apiBaseUrl: '/api',
    debug: typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production',
    dataSource: {
        useMockData: true,
        mockDataFile: 'data/processed/stock_data_strategy_test.json'
    }
};

// 全局导出配置
if (typeof window !== 'undefined') {
    window.appConfig = appConfig;
}

// 定义模块加载器
class ModuleLoader {
    constructor() {
        this.modules = {};
    }

    /**
     * 加载模块
     * @param {string} name - 模块名称
     * @param {Function} factory - 模块工厂函数
     */
    register(name, factory) {
        if (!this.modules[name]) {
            this.modules[name] = factory();
        }
        return this.modules[name];
    }

    /**
     * 获取已加载的模块
     * @param {string} name - 模块名称
     * @returns {*} 模块实例
     */
    get(name) {
        return this.modules[name];
    }
}

// 创建全局模块加载器
const moduleLoader = new ModuleLoader();
if (typeof window !== 'undefined') {
    window.moduleLoader = moduleLoader;
}

// 动态导入模块
async function initializeModules() {
    try {
        // 导入基础模块
        const StockSelector = (await import('./selector.js')).default;
        const StrategyManager = (await import('./strategy.js')).default;
        const UIManager = (await import('./ui.js')).default;
        const StockAPI = (await import('./api.js')).default;
        // VisualEffects已经在全局作用域中可用，不需要再导入
        const VisualEffects = window.VisualEffects || self.VisualEffects;
        
        // 注册模块到模块加载器
        moduleLoader.register('stockSelector', () => new StockSelector());
        moduleLoader.register('strategyManager', () => new StrategyManager());
        moduleLoader.register('uiManager', () => {
            const ui = new UIManager();
            ui.init();
            return ui;
        });
        moduleLoader.register('api', () => new StockAPI());
        moduleLoader.register('visualEffects', () => {
            const effects = new VisualEffects();
            effects.init();
            return effects;
        });
        
        // 初始化应用
        initApp();
        
    } catch (error) {
        console.error('模块加载失败:', error);
        // 降级处理：如果模块加载失败，尝试使用传统方式加载
        fallbackToTraditionalLoading();
    }
}

// 初始化应用
function initApp() {
    console.log('A股量化选股器初始化完成');
    
    // 获取必要的模块
    const uiManager = moduleLoader.get('uiManager');
    const api = moduleLoader.get('api');
    const strategyManager = moduleLoader.get('strategyManager');
    const stockSelector = moduleLoader.get('stockSelector');
    
    // 绑定选股功能
    if (uiManager && typeof uiManager.onSelectStocks === 'function') {
        uiManager.onSelectStocks = async function() {
            uiManager.showLoadingState();
            
            try {
                // 获取当前选择的策略
                const strategySelect = document.getElementById('strategy-select');
                const strategyId = strategySelect ? strategySelect.value : 'default';
                
                // 获取策略参数
                const strategyConfig = strategyManager.getStrategy(strategyId);
                const params = strategyConfig ? strategyConfig.params : {};
                
                // 调用选股API
                const result = await api.selectStocks(strategyId, params);
                
                if (result.success && result.data) {
                    // 更新选股器数据
                    stockSelector.setStockData(result.data);
                    
                    // 显示结果
                    uiManager.updateStockTable(result.data);
                    uiManager.showNotification(`选股成功，共找到 ${result.data.length} 只股票`, 'success');
                } else {
                    uiManager.showNotification('选股失败: ' + (result.message || '未知错误'), 'error');
                }
            } catch (error) {
                console.error('选股过程中发生错误:', error);
                uiManager.showNotification('选股过程中发生错误: ' + error.message, 'error');
            } finally {
                uiManager.hideLoadingState();
            }
        };
    }
    
    // 绑定策略变更事件
    if (uiManager && typeof uiManager.onStrategyChange === 'function') {
        uiManager.onStrategyChange = function(strategyId) {
            const strategyConfig = strategyManager.getStrategy(strategyId);
            if (strategyConfig) {
                uiManager.showNotification(`已选择策略: ${strategyConfig.name}`, 'info');
                
                // 动态生成策略参数表单
                const paramsContainer = document.getElementById('strategy-params');
                if (paramsContainer) {
                    generateStrategyParamsForm(paramsContainer, strategyId, strategyConfig.params);
                }
            }
        };
    }
}

// 生成策略参数表单
function generateStrategyParamsForm(container, strategyId, params) {
    // 清空容器
    container.innerHTML = '';
    
    // 如果没有参数，显示提示信息
    if (!params || Object.keys(params).length === 0) {
        container.innerHTML = '<p class="no-params">该策略无需配置参数</p>';
        return;
    }
    
    // 创建表单
    const form = document.createElement('div');
    form.className = 'params-form';
    
    // 遍历参数，创建表单项
    Object.entries(params).forEach(([key, value]) => {
        const paramGroup = document.createElement('div');
        paramGroup.className = 'param-group';
        
        // 创建标签
        const label = document.createElement('label');
        label.textContent = formatParamName(key);
        
        // 创建输入控件，根据参数类型选择不同的控件
        let input;
        if (typeof value === 'number') {
            input = document.createElement('input');
            input.type = 'number';
            input.value = value;
            input.step = '0.01';
        } else if (typeof value === 'boolean') {
            input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = value;
        } else if (Array.isArray(value)) {
            input = document.createElement('select');
            input.multiple = true;
            // 这里简化处理，实际应用中可能需要根据行业列表动态生成选项
        } else {
            input = document.createElement('input');
            input.type = 'text';
            input.value = value;
        }
        
        input.id = `param-${key}`;
        input.name = key;
        
        // 添加到参数组
        paramGroup.appendChild(label);
        paramGroup.appendChild(input);
        
        // 添加到表单
        form.appendChild(paramGroup);
    });
    
    // 添加到容器
    container.appendChild(form);
}

// 格式化参数名称
function formatParamName(paramName) {
    // 将驼峰命名转换为可读名称
    return paramName
        .replace(/([A-Z])/g, ' $1') // 在大写字母前添加空格
        .replace(/^./, str => str.toUpperCase()) // 首字母大写
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // 处理连续的大写字母
        .trim();
}

// 降级到传统加载方式
function fallbackToTraditionalLoading() {
    console.log('降级到传统加载方式');
    
    // 尝试使用原始的stock_selector.js
    if (window.StockSelector) {
        moduleLoader.register('stockSelector', () => new window.StockSelector());
    }
    
    // 简单的UI处理
    const simpleUI = {
        showNotification: function(message, type = 'info') {
            alert(message);
        }
    };
    
    moduleLoader.register('uiManager', () => simpleUI);
    
    console.log('降级加载完成，可以使用基本功能');
}

// 页面加载完成后初始化模块
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeModules);
} else {
    initializeModules();
}

// 应用初始化
class AppInitializer {
    constructor() {
        this.isReady = false;
        this.readyCallbacks = [];
    }

    /**
     * 初始化应用
     */
    async init() {
        try {
            // 等待DOM加载完成
            await this.waitForDOMReady();
            
            // 初始化日志系统
            this.initLogger();
            
            // 加载必要的CSS
            this.loadCSS();
            
            // 初始化各个模块
            await this.initializeModules();
            
            // 绑定全局事件
            this.bindGlobalEvents();
            
            this.isReady = true;
            console.log('选股器应用初始化完成');
            
            // 执行所有等待的回调
            this.readyCallbacks.forEach(callback => callback());
        } catch (error) {
            console.error('应用初始化失败:', error);
            this.showErrorNotification('应用初始化失败，请刷新页面重试');
        }
    }

    /**
     * 等待DOM加载完成
     * @returns {Promise} 当DOM加载完成时解析
     */
    waitForDOMReady() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                resolve();
            } else {
                document.addEventListener('DOMContentLoaded', resolve);
            }
        });
    }

    /**
     * 初始化日志系统
     */
    initLogger() {
        // 增强控制台日志，添加时间戳和日志级别
        const originalConsole = console;
        
        window.console = {
            ...originalConsole,
            log: (...args) => {
                if (appConfig.debug) {
                    originalConsole.log(`[${new Date().toLocaleTimeString()}] [INFO]`, ...args);
                }
            },
            warn: (...args) => {
                originalConsole.warn(`[${new Date().toLocaleTimeString()}] [WARN]`, ...args);
            },
            error: (...args) => {
                originalConsole.error(`[${new Date().toLocaleTimeString()}] [ERROR]`, ...args);
            },
            debug: (...args) => {
                if (appConfig.debug) {
                    originalConsole.debug(`[${new Date().toLocaleTimeString()}] [DEBUG]`, ...args);
                }
            }
        };
    }

    /**
     * 加载必要的CSS
     */
    loadCSS() {
        // 可以在这里动态加载CSS文件
        // 目前CSS是直接在HTML中引入的
    }

    /**
     * 初始化各个模块
     */
    async initializeModules() {
        // 初始化视觉特效模块
        if (typeof VisualEffects !== 'undefined') {
            const visualEffects = new VisualEffects();
            visualEffects.init();
            moduleLoader.register('visualEffects', () => visualEffects);
        }

        // 初始化API模块
        if (typeof TushareAPI !== 'undefined') {
            const apiClient = new TushareAPI();
            moduleLoader.register('apiClient', () => apiClient);
        }

        // 初始化选股器模块
        if (typeof StockSelector !== 'undefined') {
            const stockSelector = new StockSelector();
            moduleLoader.register('stockSelector', () => stockSelector);
        }

        // 初始化UI组件
        this.initializeUIComponents();
    }

    /**
     * 初始化UI组件
     */
    initializeUIComponents() {
        // 初始化按钮事件
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', this.handleStartSelection.bind(this));
        }

        // 初始化表单
        const strategyForm = document.getElementById('strategy-form');
        if (strategyForm) {
            strategyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleStartSelection();
            });
        }

        // 初始化结果展示区域
        this.initResultDisplay();
    }

    /**
     * 初始化结果展示区域
     */
    initResultDisplay() {
        // 在这里可以设置结果展示区域的初始状态
        // 例如创建表格、图表等
    }

    /**
     * 绑定全局事件
     */
    bindGlobalEvents() {
        // 窗口调整大小事件
        window.addEventListener('resize', this.handleResize.bind(this));

        // 页面滚动事件
        window.addEventListener('scroll', this.handleScroll.bind(this));

        // 网络状态变化事件
        window.addEventListener('online', () => this.showNotification('网络已连接'));
        window.addEventListener('offline', () => this.showNotification('网络连接已断开', 'error'));
    }

    /**
     * 处理窗口调整大小
     */
    handleResize() {
        const visualEffects = moduleLoader.get('visualEffects');
        if (visualEffects && typeof visualEffects.resizeCanvas === 'function') {
            visualEffects.resizeCanvas();
        }
    }

    /**
     * 处理页面滚动
     */
    handleScroll() {
        // 可以在这里添加滚动时的视觉效果
    }

    /**
     * 处理开始选股按钮点击
     */
    handleStartSelection() {
        // 防止重复点击
        const startBtn = document.getElementById('start-btn');
        if (startBtn && startBtn.disabled) {
            return;
        }
        
        const visualEffects = moduleLoader.get('visualEffects');
        if (visualEffects && typeof visualEffects.startSelection === 'function') {
            // 只调用visualEffects的startSelection方法，避免重复执行选股逻辑
            visualEffects.startSelection();
        }
    }

    /**
     * 执行选股操作
     */
    async performStockSelection() {
        try {
            this.showLoading(true);
            
            const apiClient = moduleLoader.get('apiClient');
            const stockSelector = moduleLoader.get('stockSelector');

            // 获取用户选择的策略和参数
            const strategy = this.getActiveStrategy();
            const params = this.getStrategyParams();

            // 获取股票数据
            let stockData;
            if (apiClient) {
                stockData = await apiClient.getStockData();
            } else {
                // 使用模拟数据
                stockData = this.getMockStockData();
            }

            // 设置数据并执行选股
            if (stockSelector) {
                stockSelector.setStockData(stockData);
                const cleanedData = stockSelector.getCleanedData();
                
                // 根据选择的策略进行选股
                let selectedStocks;
                switch(strategy) {
                    case 'breakout':
                        selectedStocks = stockSelector.breakoutStrategy(cleanedData);
                        break;
                    case 'shortTermGrowth':
                        selectedStocks = stockSelector.selectStockForShortTermGrowth();
                        break;
                    default:
                        selectedStocks = stockSelector.selectStockForShortTermGrowth();
                }

                // 展示选股结果
                this.displayResults(selectedStocks);
            }
        } catch (error) {
            console.error('选股过程中发生错误:', error);
            this.showErrorNotification('选股过程中发生错误: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * 获取用户选择的策略
     * @returns {string} 策略名称
     */
    getActiveStrategy() {
        const strategySelect = document.getElementById('strategy-select');
        if (strategySelect) {
            return strategySelect.value;
        }
        return 'default';
    }

    /**
     * 获取策略参数
     * @returns {Object} 策略参数
     */
    getStrategyParams() {
        const params = {};
        
        // 从表单中获取参数
        const formElements = document.querySelectorAll('#strategy-form input, #strategy-form select');
        formElements.forEach(element => {
            if (element.name) {
                params[element.name] = element.value;
            }
        });
        
        return params;
    }

    /**
     * 获取模拟股票数据
     * @returns {Array} 模拟股票数据
     */
    getMockStockData() {
        // 这里可以返回模拟数据，用于开发和测试
        return [];
    }

    /**
     * 展示选股结果
     * @param {Array} stocks - 选中的股票列表
     */
    displayResults(stocks) {
        const resultContainer = document.getElementById('result-container');
        if (!resultContainer) {
            console.error('结果容器未找到');
            return;
        }

        // 清空容器
        resultContainer.innerHTML = '';

        if (!stocks || stocks.length === 0) {
            resultContainer.innerHTML = '<p class="no-results">未找到符合条件的股票</p>';
            return;
        }

        // 创建结果表格
        const table = document.createElement('table');
        table.className = 'result-table';

        // 创建表头
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>股票代码</th>
                <th>股票名称</th>
                <th>当前价格</th>
                <th>涨跌幅</th>
                <th>市盈率</th>
                <th>市净率</th>
                <th>行业</th>
                <th>得分</th>
            </tr>
        `;
        table.appendChild(thead);

        // 创建表格主体
        const tbody = document.createElement('tbody');
        stocks.forEach(stock => {
            const row = document.createElement('tr');
            row.className = stock.priceChange > 0 ? 'up' : 'down';
            row.innerHTML = `
                <td>${stock.code}</td>
                <td>${stock.name}</td>
                <td>${stock.price.toFixed(2)}</td>
                <td>${stock.priceChange.toFixed(2)}%</td>
                <td>${stock.pe.toFixed(2)}</td>
                <td>${stock.pb.toFixed(2)}</td>
                <td>${stock.industry}</td>
                <td>${stock.score ? stock.score.toFixed(2) : '-'}</td>
            `;
            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        // 添加到容器
        resultContainer.appendChild(table);
    }

    /**
     * 显示加载状态
     * @param {boolean} show - 是否显示加载状态
     */
    showLoading(show) {
        const loadingElement = document.getElementById('loading-indicator');
        if (loadingElement) {
            loadingElement.style.display = show ? 'flex' : 'none';
        }
    }

    /**
     * 显示通知
     * @param {string} message - 通知消息
     * @param {string} type - 通知类型：info, success, warning, error
     */
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 自动移除
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    /**
     * 显示错误通知
     * @param {string} message - 错误消息
     */
    showErrorNotification(message) {
        this.showNotification(message, 'error');
    }

    /**
     * 显示成功通知
     * @param {string} message - 成功消息
     */
    showSuccessNotification(message) {
        this.showNotification(message, 'success');
    }

    /**
     * 当应用准备就绪时执行回调
     * @param {Function} callback - 回调函数
     */
    onReady(callback) {
        if (this.isReady) {
            callback();
        } else {
            this.readyCallbacks.push(callback);
        }
    }
}

// 导出必要的类和函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        appConfig,
        moduleLoader,
        AppInitializer
    };
}

// 初始化应用
function initApp() {
    const app = new AppInitializer();
    app.init();
    
    // 全局导出应用实例
    if (typeof window !== 'undefined') {
        window.app = app;
    }
    
    return app;
}

// 当DOM加载完成后初始化应用
if (typeof document !== 'undefined') {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initApp();
    } else {
        document.addEventListener('DOMContentLoaded', initApp);
    }
}