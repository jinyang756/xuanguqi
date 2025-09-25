/**
 * ui.js - 页面交互模块
 * 处理用户界面交互和DOM操作
 */

class UIManager {
    constructor() {
        // 菜单相关元素
        this.menuToggle = null;
        this.sidebar = null;
        this.mainContent = null;
        this.sidebarLinks = [];
        
        // 选股相关元素
        this.strategySelect = null;
        this.paramsContainer = null;
        this.selectButton = null;
        this.stockTable = null;
        
        // 图表相关元素
        this.chartContainer = null;
        
        // 消息提示相关
        this.notificationContainer = null;
        
        // 初始化状态
        this.isSidebarOpen = false;
        this.activePage = 'home';
        
        // 事件监听器存储
        this.eventListeners = {};
    }
    
    /**
     * 初始化UI管理器
     */
    init() {
        this.initializeElements();
        this.bindEvents();
        this.setupNotificationSystem();
        this.initializeTable();
        this.loadPage(this.activePage);
        
        // 响应式调整
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
    }
    
    /**
     * 初始化DOM元素引用
     */
    initializeElements() {
        // 菜单元素
        this.menuToggle = document.getElementById('menu-toggle');
        this.sidebar = document.getElementById('sidebar');
        this.mainContent = document.getElementById('main-content');
        this.sidebarLinks = document.querySelectorAll('.sidebar-link');
        
        // 选股元素
        this.strategySelect = document.getElementById('strategy-select');
        this.paramsContainer = document.getElementById('strategy-params');
        this.selectButton = document.getElementById('select-stocks-btn');
        this.stockTable = document.getElementById('stock-results-table');
        
        // 图表元素
        this.chartContainer = document.getElementById('chart-container');
    }
    
    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 菜单切换
        if (this.menuToggle && this.sidebar && this.mainContent) {
            this.menuToggle.addEventListener('click', () => this.toggleSidebar());
        }
        
        // 侧边栏链接点击
        this.sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                if (page) {
                    this.loadPage(page);
                }
            });
        });
        
        // 策略选择变化
        if (this.strategySelect) {
            this.strategySelect.addEventListener('change', (e) => {
                const strategyId = e.target.value;
                this.onStrategyChange(strategyId);
            });
        }
        
        // 选股按钮点击
        if (this.selectButton) {
            this.selectButton.addEventListener('click', () => {
                this.onSelectStocks();
            });
        }
    }
    
    /**
     * 切换侧边栏显示/隐藏
     */
    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
        
        // 切换菜单按钮的active状态
        if (this.menuToggle) {
            this.menuToggle.classList.toggle('active');
        }
        
        if (this.sidebar && this.mainContent) {
            if (this.isSidebarOpen) {
                this.sidebar.classList.add('sidebar-open');
                this.mainContent.classList.add('content-shifted');
            } else {
                this.sidebar.classList.remove('sidebar-open');
                this.mainContent.classList.remove('content-shifted');
            }
        }
    }
    
    /**
     * 加载页面内容
     * @param {string} pageId - 页面ID
     */
    loadPage(pageId) {
        // 移除所有侧边栏链接的活跃状态
        this.sidebarLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // 激活当前页面链接
        const activeLink = document.querySelector(`.sidebar-link[data-page="${pageId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // 更新当前页面状态
        this.activePage = pageId;
        
        // 显示页面加载中状态
        this.showLoadingState();
        
        // 动态加载页面内容
        this.loadPageContent(pageId).then(content => {
            if (this.mainContent) {
                this.mainContent.innerHTML = content;
                // 重新初始化元素引用和绑定事件
                this.initializeElements();
                this.bindEvents();
                this.hideLoadingState();
            }
        }).catch(error => {
            console.error('加载页面失败:', error);
            this.showNotification('页面加载失败', 'error');
            this.hideLoadingState();
        });
    }
    
    /**
     * 加载页面内容（模拟异步加载）
     * @param {string} pageId - 页面ID
     * @returns {Promise<string>} 页面HTML内容
     */
    async loadPageContent(pageId) {
        // 这里可以根据实际需求改为从服务器加载HTML片段
        // 目前使用模拟数据
        return new Promise((resolve) => {
            setTimeout(() => {
                let content = '';
                
                switch (pageId) {
                    case 'home':
                        content = this.getHomePageContent();
                        break;
                    case 'selector':
                        content = this.getSelectorPageContent();
                        break;
                    case 'strategies':
                        content = this.getStrategiesPageContent();
                        break;
                    case 'data':
                        content = this.getDataPageContent();
                        break;
                    case 'settings':
                        content = this.getSettingsPageContent();
                        break;
                    default:
                        content = this.getNotFoundPageContent();
                }
                
                resolve(content);
            }, 300); // 模拟网络延迟
        });
    }
    
    /**
     * 设置通知系统
     */
    setupNotificationSystem() {
        // 创建通知容器
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.id = 'notification-container';
        this.notificationContainer.className = 'notification-container';
        document.body.appendChild(this.notificationContainer);
    }
    
    /**
     * 显示通知
     * @param {string} message - 通知消息
     * @param {string} type - 通知类型 (success, error, info, warning)
     * @param {number} duration - 持续时间（毫秒）
     */
    showNotification(message, type = 'info', duration = 3000) {
        if (!this.notificationContainer) {
            this.setupNotificationSystem();
        }
        
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // 添加到容器
        this.notificationContainer.appendChild(notification);
        
        // 入场动画
        setTimeout(() => {
            notification.classList.add('notification-show');
        }, 10);
        
        // 设置自动关闭
        setTimeout(() => {
            notification.classList.remove('notification-show');
            notification.classList.add('notification-hide');
            
            // 移除DOM元素
            setTimeout(() => {
                if (this.notificationContainer.contains(notification)) {
                    this.notificationContainer.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
    
    /**
     * 初始化表格
     */
    initializeTable() {
        if (this.stockTable) {
            // 这里可以添加表格排序、筛选等功能
        }
    }
    
    /**
     * 显示加载状态
     */
    showLoadingState() {
        if (this.mainContent) {
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'loading-indicator';
            loadingDiv.className = 'loading-indicator';
            loadingDiv.innerHTML = `
                <div class="loading-spinner"></div>
                <p>加载中...</p>
            `;
            
            // 清空主内容并添加加载指示器
            this.mainContent.innerHTML = '';
            this.mainContent.appendChild(loadingDiv);
        }
    }
    
    /**
     * 隐藏加载状态
     */
    hideLoadingState() {
        const loadingDiv = document.getElementById('loading-indicator');
        if (loadingDiv && this.mainContent.contains(loadingDiv)) {
            this.mainContent.removeChild(loadingDiv);
        }
    }
    
    /**
     * 处理窗口大小变化
     */
    handleResize() {
        const screenWidth = window.innerWidth;
        
        // 在小屏幕上默认隐藏侧边栏
        if (screenWidth < 768) {
            this.isSidebarOpen = false;
            if (this.sidebar && this.mainContent) {
                this.sidebar.classList.remove('sidebar-open');
                this.mainContent.classList.remove('content-shifted');
            }
            // 在小屏幕上默认移除菜单按钮的active状态
            if (this.menuToggle) {
                this.menuToggle.classList.remove('active');
            }
        } else {
            // 在大屏幕上默认显示侧边栏
            this.isSidebarOpen = true;
            if (this.sidebar && this.mainContent) {
                this.sidebar.classList.add('sidebar-open');
                this.mainContent.classList.add('content-shifted');
            }
            // 在大屏幕上默认添加菜单按钮的active状态
            if (this.menuToggle) {
                this.menuToggle.classList.add('active');
            }
        }
    }
    
    /**
     * 更新选股结果表格
     * @param {Array} stocks - 股票数据数组
     */
    updateStockTable(stocks) {
        if (!this.stockTable) {
            this.stockTable = document.getElementById('stock-results-table');
            if (!this.stockTable) return;
        }
        
        // 清空表格内容
        const tbody = this.stockTable.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = '';
        }
        
        // 如果没有数据，显示空状态
        if (!stocks || stocks.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="100%" class="empty-state">暂无数据</td>`;
            if (tbody) {
                tbody.appendChild(emptyRow);
            }
            return;
        }
        
        // 填充表格数据
        stocks.forEach(stock => {
            const row = document.createElement('tr');
            
            // 根据涨跌幅设置行样式
            if (stock.change_percent > 0) {
                row.classList.add('stock-up');
            } else if (stock.change_percent < 0) {
                row.classList.add('stock-down');
            }
            
            // 构建表格行内容
            row.innerHTML = `
                <td>${stock.stock_code || '-'}</td>
                <td>${stock.stock_name || '-'}</td>
                <td>${stock.industry || '-'}</td>
                <td>${(stock.close_price || 0).toFixed(2)}</td>
                <td>${(stock.change_percent || 0).toFixed(2)}%</td>
                <td>${stock.pe ? stock.pe.toFixed(2) : '-'}</td>
                <td>${stock.pb ? stock.pb.toFixed(2) : '-'}</td>
                <td>${stock.roe ? stock.roe.toFixed(2) : '-'}</td>
                <td>${this.formatMarketCap(stock.market_cap || 0)}</td>
                <td>${stock.score ? stock.score.toFixed(1) : '-'}</td>
            `;
            
            if (tbody) {
                tbody.appendChild(row);
            }
        });
    }
    
    /**
     * 格式化市值显示
     * @param {number} marketCap - 市值（元）
     * @returns {string} 格式化后的市值字符串
     */
    formatMarketCap(marketCap) {
        if (marketCap >= 100000000) {
            return (marketCap / 100000000).toFixed(2) + '亿';
        } else if (marketCap >= 10000) {
            return (marketCap / 10000).toFixed(2) + '万';
        }
        return marketCap.toString();
    }
    
    /**
     * 策略选择变化处理函数
     * @param {string} strategyId - 策略ID
     */
    onStrategyChange(strategyId) {
        // 这里可以根据策略ID动态生成参数配置表单
        this.showNotification(`已选择策略: ${strategyId}`, 'info');
    }
    
    /**
     * 选股按钮点击处理函数
     */
    onSelectStocks() {
        // 显示加载状态
        this.showLoadingState();
        
        // 模拟选股过程
        setTimeout(() => {
            this.hideLoadingState();
            this.showNotification('选股完成', 'success');
        }, 1000);
    }
    
    getHomePageContent() {
        return `
            <div class="page-content">
                <h1>A股量化选股器</h1>
                <p>欢迎使用A股量化选股器，这是一个基于算法的股票筛选工具，可以帮助您发现潜在的投资机会。</p>
                
                <div class="features-grid">
                    <div class="feature-card">
                        <h3>多因子选股</h3>
                        <p>基于市盈率、市净率、净资产收益率等多种因子进行综合评分，筛选优质股票。</p>
                    </div>
                    
                    <div class="feature-card">
                        <h3>多种策略</h3>
                        <p>支持价值投资、成长投资、行业轮动等多种选股策略，满足不同投资风格需求。</p>
                    </div>
                    
                    <div class="feature-card">
                        <h3>数据可视化</h3>
                        <p>直观展示选股结果和分析数据，帮助您快速理解市场趋势和投资机会。</p>
                    </div>
                </div>
                
                <div class="market-overview">
                    <h2>市场概览</h2>
                    <div class="market-indices">
                        <div class="index-card">
                            <span class="index-name">上证指数</span>
                            <span class="index-value">3,128.35</span>
                            <span class="index-change">+15.62 (+0.50%)</span>
                        </div>
                        <div class="index-card">
                            <span class="index-name">深证成指</span>
                            <span class="index-value">10,348.40</span>
                            <span class="index-change">+42.16 (+0.41%)</span>
                        </div>
                        <div class="index-card">
                            <span class="index-name">创业板指</span>
                            <span class="index-value">2,105.76</span>
                            <span class="index-change">+18.93 (+0.91%)</span>
                        </div>
                    </div>
                </div>
                
                <div class="quick-access">
                    <h2>快速访问</h2>
                    <div class="quick-links">
                        <a href="#" class="quick-link" data-page="strategy">开始选股</a>
                        <a href="#" class="quick-link" data-page="watchlist">查看自选股</a>
                        <a href="#" class="quick-link" data-page="strategies">管理策略</a>
                    </div>
                </div>
            </div>
        `;
    }
    
    getSelectorPageContent() {
        return `
            <div class="page-content">
                <h1>股票选择器</h1>
                
                <div class="selector-controls">
                    <div class="control-group">
                        <label for="strategy-select">选股策略:</label>
                        <select id="strategy-select">
                            <option value="default">默认选股</option>
                            <option value="value">价值投资</option>
                            <option value="growth">成长投资</option>
                            <option value="industry">行业轮动</option>
                            <option value="breakout">短期突破</option>
                            <option value="lowValuation">低估值精选</option>
                            <option value="momentum">动量策略</option>
                            <option value="composite">复合策略</option>
                        </select>
                    </div>
                    
                    <div id="strategy-params" class="strategy-params">
                        <!-- 策略参数配置表单将动态生成 -->
                    </div>
                    
                    <div class="action-buttons">
                        <button id="select-stocks-btn" class="btn btn-primary">开始选股</button>
                        <button id="reset-btn" class="btn btn-secondary">重置参数</button>
                    </div>
                </div>
                
                <div class="results-section">
                    <h2>选股结果</h2>
                    <div class="results-actions">
                        <button id="export-results-btn" class="btn btn-secondary">导出结果</button>
                        <button id="save-to-watchlist-btn" class="btn btn-secondary">保存到自选</button>
                    </div>
                    <div class="table-responsive">
                        <table id="stock-results-table" class="stock-table">
                            <thead>
                                <tr>
                                    <th>股票代码</th>
                                    <th>股票名称</th>
                                    <th>行业</th>
                                    <th>收盘价</th>
                                    <th>涨跌幅</th>
                                    <th>市盈率(PE)</th>
                                    <th>市净率(PB)</th>
                                    <th>ROE</th>
                                    <th>市值</th>
                                    <th>评分</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- 结果将动态填充 -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
    
    getStrategiesPageContent() {
        return `
            <div class="page-content">
                <h1>策略管理</h1>
                <p>在这里您可以查看、创建和管理选股策略。</p>
                
                <div class="strategies-container">
                    <div class="strategy-section">
                        <h2>基础策略</h2>
                        <div class="strategies-list">
                            <div class="strategy-card">
                                <div class="strategy-header">
                                    <h3>价值投资</h3>
                                    <div class="strategy-actions">
                                        <button class="btn btn-sm" data-strategy="value">使用</button>
                                        <button class="btn btn-sm btn-secondary">详情</button>
                                    </div>
                                </div>
                                <p class="strategy-description">筛选低市盈率、低市净率、高ROE的股票，适合长期投资。</p>
                                <div class="strategy-metrics">
                                    <span class="metric">PE ≤ 15</span>
                                    <span class="metric">PB ≤ 2</span>
                                    <span class="metric">ROE ≥ 15%</span>
                                </div>
                            </div>
                            
                            <div class="strategy-card">
                                <div class="strategy-header">
                                    <h3>成长投资</h3>
                                    <div class="strategy-actions">
                                        <button class="btn btn-sm" data-strategy="growth">使用</button>
                                        <button class="btn btn-sm btn-secondary">详情</button>
                                    </div>
                                </div>
                                <p class="strategy-description">关注营收和利润增长较快的公司，适合成长型投资者。</p>
                                <div class="strategy-metrics">
                                    <span class="metric">增长率 ≥ 20%</span>
                                </div>
                            </div>
                            
                            <div class="strategy-card">
                                <div class="strategy-header">
                                    <h3>行业轮动</h3>
                                    <div class="strategy-actions">
                                        <button class="btn btn-sm" data-strategy="industry">使用</button>
                                        <button class="btn btn-sm btn-secondary">详情</button>
                                    </div>
                                </div>
                                <p class="strategy-description">选择特定行业中的优质股票，把握行业景气度变化。</p>
                                <div class="strategy-metrics">
                                    <span class="metric">可选多个行业</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="strategy-section">
                        <h2>高级策略</h2>
                        <div class="strategies-list">
                            <div class="strategy-card">
                                <div class="strategy-header">
                                    <h3>短期突破</h3>
                                    <div class="strategy-actions">
                                        <button class="btn btn-sm" data-strategy="breakout">使用</button>
                                        <button class="btn btn-sm btn-secondary">详情</button>
                                    </div>
                                </div>
                                <p class="strategy-description">筛选成交量异常放大、价格突破的股票，适合短线交易。</p>
                                <div class="strategy-metrics">
                                    <span class="metric">成交量阈值: 1.5倍</span>
                                    <span class="metric">连续突破天数: 3天</span>
                                </div>
                            </div>
                            
                            <div class="strategy-card">
                                <div class="strategy-header">
                                    <h3>低估值精选</h3>
                                    <div class="strategy-actions">
                                        <button class="btn btn-sm" data-strategy="lowValuation">使用</button>
                                        <button class="btn btn-sm btn-secondary">详情</button>
                                    </div>
                                </div>
                                <p class="strategy-description">筛选估值处于历史低位的优质股票，等待价值回归。</p>
                                <div class="strategy-metrics">
                                    <span class="metric">PE百分位: 20%</span>
                                    <span class="metric">PB百分位: 20%</span>
                                </div>
                            </div>
                            
                            <div class="strategy-card">
                                <div class="strategy-header">
                                    <h3>动量策略</h3>
                                    <div class="strategy-actions">
                                        <button class="btn btn-sm" data-strategy="momentum">使用</button>
                                        <button class="btn btn-sm btn-secondary">详情</button>
                                    </div>
                                </div>
                                <p class="strategy-description">跟踪近期表现强势的股票，利用价格动量获取超额收益。</p>
                                <div class="strategy-metrics">
                                    <span class="metric">动量周期: 60天</span>
                                </div>
                            </div>
                            
                            <div class="strategy-card">
                                <div class="strategy-header">
                                    <h3>复合策略</h3>
                                    <div class="strategy-actions">
                                        <button class="btn btn-sm" data-strategy="composite">使用</button>
                                        <button class="btn btn-sm btn-secondary">详情</button>
                                    </div>
                                </div>
                                <p class="strategy-description">结合多种因子，通过加权计算综合评分，多维度筛选优质股票。</p>
                                <div class="strategy-metrics">
                                    <span class="metric">多因子加权</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="strategy-section">
                        <div class="section-header">
                            <h2>自定义策略</h2>
                            <button class="btn btn-primary">创建新策略</button>
                        </div>
                        <div class="strategies-list">
                            <div class="no-strategies">
                                <p>暂无自定义策略，点击上方按钮创建新策略</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getWatchlistPageContent() {
        return `
            <div class="page-content">
                <h1>自选列表</h1>
                <p>管理您关注的股票，随时查看它们的最新行情和分析数据。</p>
                
                <div class="watchlist-actions">
                    <div class="search-bar">
                        <input type="text" id="watchlist-search" placeholder="搜索自选股...">
                        <button class="btn btn-sm">搜索</button>
                    </div>
                    <button class="btn btn-primary" id="add-to-watchlist-btn">添加股票</button>
                </div>
                
                <div class="watchlist-container">
                    <table id="watchlist-table" class="stock-table">
                        <thead>
                            <tr>
                                <th>股票代码</th>
                                <th>股票名称</th>
                                <th>行业</th>
                                <th>最新价</th>
                                <th>涨跌幅</th>
                                <th>市盈率(PE)</th>
                                <th>市净率(PB)</th>
                                <th>ROE</th>
                                <th>添加时间</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="stock-up">
                                <td>000001</td>
                                <td>平安银行</td>
                                <td>银行</td>
                                <td>12.34</td>
                                <td>+2.34%</td>
                                <td>5.67</td>
                                <td>0.89</td>
                                <td>12.5%</td>
                                <td>2024-07-20</td>
                                <td>
                                    <button class="btn btn-sm" title="查看详情">详情</button>
                                    <button class="btn btn-sm btn-danger" title="移除">移除</button>
                                </td>
                            </tr>
                            <tr class="stock-down">
                                <td>600519</td>
                                <td>贵州茅台</td>
                                <td>酿酒</td>
                                <td>1899.00</td>
                                <td>-1.23%</td>
                                <td>28.9</td>
                                <td>9.8</td>
                                <td>30.2%</td>
                                <td>2024-07-18</td>
                                <td>
                                    <button class="btn btn-sm" title="查看详情">详情</button>
                                    <button class="btn btn-sm btn-danger" title="移除">移除</button>
                                </td>
                            </tr>
                            <tr class="stock-up">
                                <td>000858</td>
                                <td>五粮液</td>
                                <td>酿酒</td>
                                <td>168.50</td>
                                <td>+0.89%</td>
                                <td>19.6</td>
                                <td>5.2</td>
                                <td>25.7%</td>
                                <td>2024-07-15</td>
                                <td>
                                    <button class="btn btn-sm" title="查看详情">详情</button>
                                    <button class="btn btn-sm btn-danger" title="移除">移除</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    getHistoryPageContent() {
        return `
            <div class="page-content">
                <h1>选股历史</h1>
                <p>查看您之前执行的选股任务和结果记录。</p>
                
                <div class="history-filters">
                    <div class="filter-group">
                        <label for="history-strategy">策略:</label>
                        <select id="history-strategy">
                            <option value="all">全部策略</option>
                            <option value="value">价值投资</option>
                            <option value="growth">成长投资</option>
                            <option value="industry">行业轮动</option>
                            <option value="breakout">短期突破</option>
                            <option value="lowValuation">低估值精选</option>
                            <option value="momentum">动量策略</option>
                            <option value="composite">复合策略</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label for="history-date">日期范围:</label>
                        <input type="date" id="history-date-start">
                        <span>至</span>
                        <input type="date" id="history-date-end">
                    </div>
                    
                    <button class="btn btn-primary">查询</button>
                </div>
                
                <div class="history-container">
                    <table id="history-table" class="history-table">
                        <thead>
                            <tr>
                                <th>选股时间</th>
                                <th>使用策略</th>
                                <th>参数设置</th>
                                <th>选股数量</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>2024-07-20 15:30</td>
                                <td>复合策略</td>
                                <td>topN:10, weights:{pe:0.3,pb:0.2,roe:0.5}</td>
                                <td>10</td>
                                <td>
                                    <button class="btn btn-sm" title="查看结果">查看</button>
                                    <button class="btn btn-sm btn-secondary" title="重新执行">重做</button>
                                    <button class="btn btn-sm btn-danger" title="删除">删除</button>
                                </td>
                            </tr>
                            <tr>
                                <td>2024-07-19 10:15</td>
                                <td>价值投资</td>
                                <td>peMax:15, pbMax:2, roeMin:15, topN:10</td>
                                <td>8</td>
                                <td>
                                    <button class="btn btn-sm" title="查看结果">查看</button>
                                    <button class="btn btn-sm btn-secondary" title="重新执行">重做</button>
                                    <button class="btn btn-sm btn-danger" title="删除">删除</button>
                                </td>
                            </tr>
                            <tr>
                                <td>2024-07-18 14:45</td>
                                <td>行业轮动</td>
                                <td>industry:科技, topN:5</td>
                                <td>5</td>
                                <td>
                                    <button class="btn btn-sm" title="查看结果">查看</button>
                                    <button class="btn btn-sm btn-secondary" title="重新执行">重做</button>
                                    <button class="btn btn-sm btn-danger" title="删除">删除</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    getSettingsPageContent() {
        return `
            <div class="page-content">
                <h1>系统设置</h1>
                <p>配置选股器的各项系统参数。</p>
                
                <div class="settings-container">
                    <div class="settings-section">
                        <h2>用户设置</h2>
                        <form id="user-settings-form">
                            <div class="form-group">
                                <label for="display-name">显示名称:</label>
                                <input type="text" id="display-name" placeholder="输入您的显示名称">
                            </div>
                            
                            <div class="form-group">
                                <label for="theme-select">主题设置:</label>
                                <select id="theme-select">
                                    <option value="dark">深色主题</option>
                                    <option value="light">浅色主题</option>
                                    <option value="auto">跟随系统</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="language-select">语言设置:</label>
                                <select id="language-select">
                                    <option value="zh-CN">简体中文</option>
                                    <option value="en-US">English</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    
                    <div class="settings-section">
                        <h2>API设置</h2>
                        <form id="api-settings-form">
                            <div class="form-group">
                                <label for="api-key">API密钥:</label>
                                <input type="password" id="api-key" placeholder="输入您的API密钥">
                            </div>
                            
                            <div class="form-group">
                                <label for="data-source">数据来源:</label>
                                <select id="data-source">
                                    <option value="mock">模拟数据</option>
                                    <option value="api">实时API</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="update-frequency">数据更新频率(分钟):</label>
                                <input type="number" id="update-frequency" min="1" max="60" value="30">
                            </div>
                        </form>
                    </div>
                    
                    <div class="settings-section">
                        <h2>选股设置</h2>
                        <form id="selector-settings-form">
                            <div class="form-group">
                                <label for="default-strategy">默认选股策略:</label>
                                <select id="default-strategy">
                                    <option value="default">默认选股</option>
                                    <option value="value">价值投资</option>
                                    <option value="growth">成长投资</option>
                                    <option value="industry">行业轮动</option>
                                    <option value="breakout">短期突破</option>
                                    <option value="lowValuation">低估值精选</option>
                                    <option value="momentum">动量策略</option>
                                    <option value="composite">复合策略</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="max-results">最大选股数量:</label>
                                <input type="number" id="max-results" min="1" max="100" value="20">
                            </div>
                        </form>
                    </div>
                    
                    <div class="settings-actions">
                        <button class="btn btn-primary">保存设置</button>
                        <button class="btn btn-secondary">恢复默认</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    getAboutUsPageContent() {
        return `
            <div class="page-content">
                <h1>关于我们</h1>
                
                <div class="about-section">
                    <h2>公司简介</h2>
                    <p>A股量化选股器是一款专注于A股市场的智能选股工具，旨在通过先进的算法模型和数据分析，为投资者提供科学、高效的选股决策支持。</p>
                    
                    <h2>我们的使命</h2>
                    <p>利用人工智能和大数据技术，让投资变得更简单、更智能、更高效，帮助普通投资者也能享受到专业机构级别的投资分析服务。</p>
                    
                    <h2>团队介绍</h2>
                    <div class="team-members">
                        <div class="team-member">
                            <div class="member-info">
                                <h3>张明</h3>
                                <p>创始人 & CEO</p>
                                <p>前资深量化分析师，拥有10年金融市场经验</p>
                            </div>
                        </div>
                        <div class="team-member">
                            <div class="member-info">
                                <h3>李华</h3>
                                <p>技术总监</p>
                                <p>前互联网大厂技术专家，AI算法领域专家</p>
                            </div>
                        </div>
                        <div class="team-member">
                            <div class="member-info">
                                <h3>王芳</h3>
                                <p>产品总监</p>
                                <p>金融科技产品设计专家，用户体验优化师</p>
                            </div>
                        </div>
                    </div>
                    
                    <h2>联系方式</h2>
                    <div class="contact-info">
                        <p>邮箱: contact@stockselector.com</p>
                        <p>电话: 400-123-4567</p>
                        <p>地址: 北京市朝阳区金融街88号</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    getPartnerInstitutionsPageContent() {
        return `
            <div class="page-content">
                <h1>合作机构</h1>
                <p>A股量化选股器与多家知名金融机构、数据提供商建立了战略合作关系，共同为用户提供优质的金融服务。</p>
                
                <div class="partners-section">
                    <h2>数据合作伙伴</h2>
                    <div class="partners-grid">
                        <div class="partner-card">
                            <h3>中证数据</h3>
                            <p>提供A股市场实时行情数据、历史交易数据和财务数据</p>
                        </div>
                        <div class="partner-card">
                            <h3>万得资讯</h3>
                            <p>提供金融数据、信息和软件服务的综合性金融信息服务公司</p>
                        </div>
                        <div class="partner-card">
                            <h3>东方财富</h3>
                            <p>提供金融数据、数据分析和投资咨询服务的金融科技公司</p>
                        </div>
                    </div>
                    
                    <h2>技术合作伙伴</h2>
                    <div class="partners-grid">
                        <div class="partner-card">
                            <h3>阿里云</h3>
                            <p>提供云计算服务支持，确保系统稳定运行</p>
                        </div>
                        <div class="partner-card">
                            <h3>腾讯云</h3>
                            <p>提供云服务器和数据存储服务</p>
                        </div>
                        <div class="partner-card">
                            <h3>百度AI</h3>
                            <p>提供人工智能算法和模型支持</p>
                        </div>
                    </div>
                    
                    <h2>金融机构合作</h2>
                    <div class="partners-grid">
                        <div class="partner-card">
                            <h3>招商证券</h3>
                            <p>提供交易通道和投资咨询服务合作</p>
                        </div>
                        <div class="partner-card">
                            <h3>国泰君安</h3>
                            <p>提供研究报告和市场分析合作</p>
                        </div>
                        <div class="partner-card">
                            <h3>华夏基金</h3>
                            <p>提供基金产品和投资策略合作</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getLoginPageContent() {
        return `
            <div class="page-content login-content">
                <div class="login-container">
                    <h1>用户登录</h1>
                    <p>登录您的账户以使用更多高级功能</p>
                    
                    <form id="login-form">
                        <div class="form-group">
                            <label for="username">用户名/邮箱:</label>
                            <input type="text" id="username" placeholder="请输入用户名或邮箱">
                        </div>
                        
                        <div class="form-group">
                            <label for="password">密码:</label>
                            <input type="password" id="password" placeholder="请输入密码">
                        </div>
                        
                        <div class="form-options">
                            <label class="checkbox-label">
                                <input type="checkbox"> 记住我
                            </label>
                            <a href="#" class="forgot-password">忘记密码?</a>
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-block">登录</button>
                    </form>
                    
                    <div class="register-link">
                        <p>还没有账户? <a href="#" id="register-link">立即注册</a></p>
                    </div>
                </div>
            </div>
        `;
    }
    
    getNotFoundPageContent() {
        return `
            <div class="page-content">
                <div class="not-found">
                    <h1>404</h1>
                    <p>页面不存在</p>
                    <button class="btn btn-primary" onclick="window.location.href='#'">返回首页</button>
                </div>
            </div>
        `;
    }
}

// 导出模块
export default UIManager;