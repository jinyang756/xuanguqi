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
    
    // 页面内容模板
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
                        </select>
                    </div>
                    
                    <div id="strategy-params" class="strategy-params">
                        <!-- 策略参数配置表单将动态生成 -->
                    </div>
                    
                    <button id="select-stocks-btn" class="btn btn-primary">开始选股</button>
                </div>
                
                <div class="results-section">
                    <h2>选股结果</h2>
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
                    <h2>基础策略</h2>
                    <div class="strategies-list">
                        <!-- 基础策略列表 -->
                    </div>
                    
                    <h2>高级策略</h2>
                    <div class="strategies-list">
                        <!-- 高级策略列表 -->
                    </div>
                    
                    <h2>自定义策略</h2>
                    <div class="strategies-list">
                        <!-- 自定义策略列表 -->
                    </div>
                    
                    <button class="btn btn-primary">创建新策略</button>
                </div>
            </div>
        `;
    }
    
    getDataPageContent() {
        return `
            <div class="page-content">
                <h1>数据管理</h1>
                <p>管理选股器使用的数据来源和缓存设置。</p>
                
                <div class="data-settings">
                    <h2>数据来源</h2>
                    <!-- 数据来源设置 -->
                    
                    <h2>缓存管理</h2>
                    <!-- 缓存管理设置 -->
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
                    <h2>用户设置</h2>
                    <!-- 用户设置表单 -->
                    
                    <h2>API设置</h2>
                    <!-- API设置表单 -->
                    
                    <h2>界面设置</h2>
                    <!-- 界面设置表单 -->
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