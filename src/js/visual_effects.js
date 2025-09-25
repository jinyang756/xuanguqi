// visual_effects.js - 实现科技感视觉特效

/**
 * 视觉特效类，负责处理所有动画效果
 */
class VisualEffects {
    constructor() {
        this.canvas = null;
        this.particlesJSInstance = null;
        this.moon = null;
        this.showMoon = false;
        this.moonCrack = false;
        this.isAnimating = false;
    }

    /**
     * 初始化视觉特效
     */
    init() {
        this.canvas = document.getElementById('visual-canvas');
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        // 使用我们自己实现的基础粒子系统，不依赖外部库
        this.initializeBasicParticles();
        this.initializeMoon();
        this.bindEvents();
    }

    /**
     * 初始化粒子系统
     */
    initParticlesJS() {
        // 移除对particles.js的依赖，直接使用我们自己实现的粒子系统
        console.log('Using built-in particle system instead of particles.js');
        this.initializeBasicParticles();
    }

    /**
     * 粒子系统实现
     */
    fallbackParticles() {
        // 直接使用我们自己实现的粒子系统
        this.initializeBasicParticles();
    }

    /**
     * 调整画布大小以适应窗口
     */
    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    }

    /**
     * 初始化基本粒子系统
     */
    initializeBasicParticles() {
        this.particles = [];
        const particleCount = Math.floor(window.innerWidth * window.innerHeight / 2000);
        
        for(let i=0; i<particleCount; i++) {
            this.particles.push({
                x: Math.random() * (this.canvas ? this.canvas.width : window.innerWidth),
                y: Math.random() * (this.canvas ? this.canvas.height : window.innerHeight),
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                color: `rgba(${Math.floor(Math.random() * 5 + 250)}, ${Math.floor(Math.random() * 255 + 200)}, ${Math.floor(Math.random() * 255 + 200)}, ${0.5 + Math.random() * 0.5})`,
                phase: Math.random() * Math.PI * 2,
                alpha: 1
            });
        }
    }

    /**
     * 绘制基本粒子（用于fallback）
     */
    drawBasicParticles() {
        // 添加ctx存在性检查
        if (!this.ctx) {
            console.error('Canvas context is not initialized');
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles.forEach(particle => {
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    /**
     * 绑定事件处理器
     */
    bindEvents() {
        // 窗口调整大小事件
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.initializeMoon();
            
            // 重置基础粒子系统
            this.particles = [];
            this.initializeBasicParticles();
        });

        // 确保在DOM完全加载后再查找开始按钮
        const checkStartButton = () => {
            const startBtn = document.getElementById('start-btn');
            if (startBtn) {
                // 移除之前可能已经添加的事件监听器，避免重复绑定
                const newStartBtn = startBtn.cloneNode(true);
                startBtn.parentNode.replaceChild(newStartBtn, startBtn);
                newStartBtn.addEventListener('click', () => this.startSelection());
            } else if (document.readyState !== 'complete') {
                // 如果DOM还没完全加载，继续检查
                setTimeout(checkStartButton, 100);
            }
        };

        // 如果页面已经加载完成，直接检查按钮
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            checkStartButton();
        } else {
            // 否则等待DOM加载完成
            document.addEventListener('DOMContentLoaded', checkStartButton);
        }
    }

    /**
     * 绘制粒子系统
     */
    drawParticles() {
        if (!this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        
        for(let p of this.particles) {
            this.ctx.globalAlpha = p.alpha;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = "#00faff";
            this.ctx.shadowColor = "#00faff";
            this.ctx.shadowBlur = 8;
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }

    /**
     * 开始选股动画流程
     */
    startSelection() {
        if (this.isAnimating) return;
        
        // 重置UI状态
        const resultElement = document.getElementById('result');
        if (resultElement) {
            resultElement.style.display = "none";
            resultElement.innerHTML = '';
        }

        // 隐藏其他按钮直到特效完成
        const startBtn = document.getElementById('start-btn');
        const restartBtn = document.getElementById('restart-btn');
        const homeBtn = document.getElementById('home-btn');
        const trackBtn = document.getElementById('track-btn');
        
        if (startBtn) {
            startBtn.disabled = true;
            startBtn.style.opacity = '0.5';
        }
        
        if (restartBtn) {
            restartBtn.style.display = 'none';
        }
        
        if (homeBtn) {
            homeBtn.style.display = 'none';
        }
        
        if (trackBtn) {
            trackBtn.style.display = 'none';
        }

        // 重置动画状态
        this.isAnimating = true;
        this.initializeMoon();
        this.initializeParticles();

        // 开始粒子动画
        this.animateParticlesToMoon();
    }

    /**
     * 绘制月亮
     */
    drawMoon() {
        // 添加ctx存在性检查
        if (!this.ctx || !this.moon) {
            console.error('Canvas context or moon is not initialized');
            return;
        }

        const gradient = this.ctx.createRadialGradient(
            this.moon.x, this.moon.y,
            0,
            this.moon.x, this.moon.y,
            this.moon.size
        );
        
        gradient.addColorStop(0, `rgba(5, 255, 161, ${this.moon.opacity})`);
        gradient.addColorStop(0.8, `rgba(5, 255, 161, ${this.moon.opacity * 0.8})`);
        gradient.addColorStop(1, `rgba(5, 255, 161, 0)`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(this.moon.x, this.moon.y, this.moon.size, 0, Math.PI * 2);
        this.ctx.fill();
    }

    /**
     * 粒子飞向月亮动画
     */
    animateParticlesToMoon() {
        // 添加canvas和moon存在性检查
        if (!this.canvas || !this.ctx || !this.moon) {
            console.error('Canvas or moon is not initialized');
            this.isAnimating = false;
            return;
        }

        this.animationFrame = requestAnimationFrame(() => this.animateParticlesToMoon());
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制月亮
        this.drawMoon();
        
        let allParticlesArrived = true;
        
        // 更新并绘制所有粒子
        this.particles.forEach(particle => {
            // 计算粒子到月亮中心的向量
            const dx = this.moon.x - particle.x;
            const dy = this.moon.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 如果粒子离月亮还有一定距离，则继续移动
            if (distance > this.moon.size) {
                allParticlesArrived = false;
                
                // 粒子移动速度随距离增加而增加
                const speed = Math.min(distance * 0.02, 10);
                
                // 归一化向量并移动粒子
                particle.x += (dx / distance) * speed;
                particle.y += (dy / distance) * speed;
                
                // 粒子大小随距离减小而减小
                particle.size = Math.max(0.5, particle.size * 0.99);
                
                // 粒子透明度随距离减小而增加
                const opacity = Math.max(0.2, 1 - distance / (this.canvas.width * 0.5));
                particle.color = `rgba(5, 255, 161, ${opacity})`;
                
                // 绘制粒子
                this.ctx.fillStyle = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        // 如果所有粒子都到达了月亮位置，开始显示选股结果
        if (allParticlesArrived) {
            this.animateMoon();
        }
    }

    /**
     * 月亮动画
     */
    animateMoon() {
        // 添加canvas和moon存在性检查
        if (!this.canvas || !this.ctx || !this.moon) {
            console.error('Canvas or moon is not initialized');
            this.isAnimating = false;
            return;
        }

        if (!this.moonAnimationStart) {
            this.moonAnimationStart = Date.now();
        }
        
        const elapsed = Date.now() - this.moonAnimationStart;
        const duration = 1000; // 1秒
        
        if (elapsed < duration) {
            // 月亮逐渐变大
            const progress = elapsed / duration;
            this.moon.size = 30 + progress * 70;
            this.moon.opacity = 0.8 + progress * 0.2;
            
            // 继续动画
            this.animationFrame = requestAnimationFrame(() => this.animateMoon());
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawMoon();
        } else {
            // 动画结束，开始显示选股结果
            setTimeout(() => {
                this.crackMoon();
            }, 500);
        }
    }

    /**
     * 月亮碎裂动画
     */
    crackMoon() {
        // 添加canvas和moon存在性检查
        if (!this.canvas || !this.ctx || !this.moon) {
            console.error('Canvas or moon is not initialized');
            this.isAnimating = false;
            return;
        }

        if (!this.crackAnimationStart) {
            this.crackAnimationStart = Date.now();
        }
        
        const elapsed = Date.now() - this.crackAnimationStart;
        const duration = 500; // 0.5秒
        
        if (elapsed < duration) {
            // 月亮逐渐消失
            const progress = elapsed / duration;
            this.moon.opacity = 1 - progress;
            
            // 继续动画
            this.animationFrame = requestAnimationFrame(() => this.crackMoon());
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawMoon();
        } else {
            // 动画结束，显示选股结果
            this.showResult();
        }
    }

    /**
     * 显示选股结果
     */
    showResult() {
        // 添加canvas和DOM元素存在性检查
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        if (this.canvas && this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // 重置动画状态
        this.isAnimating = false;
        
        // 显示选股结果
        const resultElement = document.getElementById('result');
        if (resultElement) {
            resultElement.style.display = "block";
        }
        
        // 获取选股结果并显示
        let stocks = this.getStockDataFromApp();
        
        if (!stocks || stocks.length === 0) {
            // 如果没有获取到数据，使用模拟数据
            stocks = [
                {stockCode: '000001', stockName: '平安银行', industry: '银行', price: 12.34, changePercent: 2.34, pe: 5.67, pb: 0.89, roe: 12.5, marketCap: 280000000000},
                {stockCode: '600519', stockName: '贵州茅台', industry: '酿酒', price: 1899.00, changePercent: -1.23, pe: 28.9, pb: 9.8, roe: 30.2, marketCap: 2400000000000},
                {stockCode: '000858', stockName: '五粮液', industry: '酿酒', price: 168.50, changePercent: 0.89, pe: 19.6, pb: 5.2, roe: 25.7, marketCap: 600000000000}
            ];
        }

        // 清空结果容器
        if (resultElement) {
            resultElement.innerHTML = '';
        }

        // 创建结果标题
        if (resultElement) {
            const resultTitle = document.createElement('h2');
            resultTitle.className = 'result-title';
            resultTitle.textContent = '选股结果';
            resultElement.appendChild(resultTitle);
        }

        // 创建股票卡片容器
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'stock-cards-container';
        
        if (resultElement) {
            resultElement.appendChild(cardsContainer);
        }

        // 为每个股票创建卡片
        stocks.forEach((stock, index) => {
            setTimeout(() => {
                const card = this.createStockCard(stock);
                if (card && cardsContainer) {
                    cardsContainer.appendChild(card);
                    // 添加入场动画
                    setTimeout(() => {
                        card.classList.add('card-visible');
                    }, 10);
                }
            }, index * 150); // 每张卡片延迟出现
        });

        // 显示按钮
        const startBtn = document.getElementById('start-btn');
        const restartBtn = document.getElementById('restart-btn');
        const homeBtn = document.getElementById('home-btn');
        const trackBtn = document.getElementById('track-btn');
        
        if (startBtn) {
            startBtn.style.display = 'none';
        }
        
        if (restartBtn) {
            restartBtn.style.display = 'inline-block';
            restartBtn.addEventListener('click', () => {
                // 重新加载页面
                location.reload();
            });
        }
        
        if (homeBtn) {
            homeBtn.style.display = 'inline-block';
            homeBtn.addEventListener('click', () => {
                // 返回首页
                location.href = '/';
            });
        }
        
        if (trackBtn) {
            trackBtn.style.display = 'inline-block';
            trackBtn.addEventListener('click', () => {
                // 显示个股追踪模态框
                const trackModal = document.getElementById('track-stock-modal');
                if (trackModal) {
                    trackModal.classList.remove('hidden');
                }
            });
        }
    }

    /**
     * 重置动画状态
     */
    reset() {
        // 添加canvas存在性检查
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        if (this.canvas && this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        this.isAnimating = false;
        this.moonAnimationStart = null;
        this.crackAnimationStart = null;
        
        // 重置粒子系统
        this.initializeBasicParticles();
        this.drawBasicParticles();
    }

    /**
     * 设置home按钮过渡动画
     */
    setHomeButtonTransition() {
        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) {
            homeBtn.style.transition = 'all 0.3s ease';
            homeBtn.style.transform = 'translateY(20px)';
            homeBtn.style.opacity = '0';
            homeBtn.style.display = 'inline-block';
            
            setTimeout(() => {
                if (homeBtn) {
                    homeBtn.style.transform = 'translateY(0)';
                    homeBtn.style.opacity = '1';
                }
            }, 500);
        }
    }

    /**
     * 设置track按钮过渡动画
     */
    setTrackButtonTransition() {
        const trackBtn = document.getElementById('track-btn');
        if (trackBtn) {
            trackBtn.style.transition = 'all 0.3s ease';
            trackBtn.style.transform = 'translateY(20px)';
            trackBtn.style.opacity = '0';
            trackBtn.style.display = 'inline-block';
            
            setTimeout(() => {
                if (trackBtn) {
                    trackBtn.style.transform = 'translateY(0)';
                    trackBtn.style.opacity = '1';
                }
            }, 700);
        }
    }

    /**
     * 从应用获取股票数据
     */
    getStockDataFromApp() {
        // 检查app对象是否存在并包含performStockSelection方法
        if (window.app && typeof window.app.performStockSelection === 'function') {
            try {
                const result = window.app.performStockSelection();
                if (result && result.stocks) {
                    return result.stocks;
                } else {
                    console.error('获取选股结果失败: 结果格式不正确');
                }
            } catch (error) {
                console.error('获取选股结果时发生错误:', error);
            }
        }
        
        // 获取活跃策略
        const strategy = this.getActiveStrategy();
        
        // 根据不同策略返回模拟数据
        if (strategy === 'default') {
            return [
                {stockCode: '000001', stockName: '平安银行', industry: '银行', price: 12.34, changePercent: 2.34, pe: 5.67, pb: 0.89, roe: 12.5, marketCap: 280000000000},
                {stockCode: '600519', stockName: '贵州茅台', industry: '酿酒', price: 1899.00, changePercent: -1.23, pe: 28.9, pb: 9.8, roe: 30.2, marketCap: 2400000000000},
                {stockCode: '000858', stockName: '五粮液', industry: '酿酒', price: 168.50, changePercent: 0.89, pe: 19.6, pb: 5.2, roe: 25.7, marketCap: 600000000000}
            ];
        } else if (strategy === 'value') {
            return [
                {stockCode: '000001', stockName: '平安银行', industry: '银行', price: 12.34, changePercent: 2.34, pe: 5.67, pb: 0.89, roe: 12.5, marketCap: 280000000000},
                {stockCode: '601318', stockName: '中国平安', industry: '保险', price: 45.67, changePercent: 0.89, pe: 7.89, pb: 1.23, roe: 15.6, marketCap: 800000000000}
            ];
        } else if (strategy === 'growth') {
            return [
                {stockCode: '300750', stockName: '宁德时代', industry: '电池', price: 523.45, changePercent: 3.45, pe: 45.6, pb: 8.9, roe: 18.7, marketCap: 1200000000000},
                {stockCode: '002594', stockName: '比亚迪', industry: '汽车', price: 258.76, changePercent: -1.23, pe: 89.7, pb: 9.8, roe: 12.3, marketCap: 700000000000}
            ];
        } else if (strategy === 'industry') {
            return [
                {stockCode: '002415', stockName: '海康威视', industry: '安防', price: 45.67, changePercent: 1.23, pe: 23.4, pb: 3.2, roe: 16.5, marketCap: 300000000000},
                {stockCode: '000858', stockName: '五粮液', industry: '酿酒', price: 168.50, changePercent: 0.89, pe: 19.6, pb: 5.2, roe: 25.7, marketCap: 600000000000}
            ];
        } else if (strategy === 'breakout') {
            return [
                {stockCode: '601899', stockName: '紫金矿业', industry: '有色', price: 8.90, changePercent: 5.67, pe: 12.3, pb: 1.5, roe: 10.8, marketCap: 200000000000},
                {stockCode: '000063', stockName: '中兴通讯', industry: '通信', price: 32.10, changePercent: 4.56, pe: 28.9, pb: 2.8, roe: 11.2, marketCap: 150000000000}
            ];
        } else if (strategy === 'lowValuation') {
            return [
                {stockCode: '600036', stockName: '招商银行', industry: '银行', price: 36.78, changePercent: 0.56, pe: 6.78, pb: 1.2, roe: 16.8, marketCap: 900000000000},
                {stockCode: '601318', stockName: '中国平安', industry: '保险', price: 45.67, changePercent: 0.89, pe: 7.89, pb: 1.23, roe: 15.6, marketCap: 800000000000}
            ];
        } else if (strategy === 'momentum') {
            return [
                {stockCode: '300750', stockName: '宁德时代', industry: '电池', price: 523.45, changePercent: 3.45, pe: 45.6, pb: 8.9, roe: 18.7, marketCap: 1200000000000},
                {stockCode: '002594', stockName: '比亚迪', industry: '汽车', price: 258.76, changePercent: -1.23, pe: 89.7, pb: 9.8, roe: 12.3, marketCap: 700000000000}
            ];
        } else if (strategy === 'composite') {
            return [
                {stockCode: '000001', stockName: '平安银行', industry: '银行', price: 12.34, changePercent: 2.34, pe: 5.67, pb: 0.89, roe: 12.5, marketCap: 280000000000},
                {stockCode: '600519', stockName: '贵州茅台', industry: '酿酒', price: 1899.00, changePercent: -1.23, pe: 28.9, pb: 9.8, roe: 30.2, marketCap: 2400000000000},
                {stockCode: '000858', stockName: '五粮液', industry: '酿酒', price: 168.50, changePercent: 0.89, pe: 19.6, pb: 5.2, roe: 25.7, marketCap: 600000000000}
            ];
        }
        
        // 默认返回空数组
        return [];
    }

    /**
     * 获取活跃策略
     */
    getActiveStrategy() {
        const strategySelect = document.getElementById('strategy-select');
        if (strategySelect) {
            return strategySelect.value || 'default';
        }
        return 'default';
    }

    /**
     * 创建股票卡片
     */
    createStockCard(stock) {
        // 验证stock对象
        if (!stock || typeof stock !== 'object') {
            console.error('无效的股票数据');
            return null;
        }

        const card = document.createElement('div');
        card.className = 'stock-card';
        
        // 设置卡片样式
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        // 填充卡片内容
        card.innerHTML = `
            <div class="stock-header">
                <span class="stock-code">${stock.stockCode || '-'}</span>
                <span class="stock-name">${stock.stockName || '-'}</span>
            </div>
            <div class="stock-price ${stock.changePercent > 0 ? 'price-up' : stock.changePercent < 0 ? 'price-down' : ''}">
                <span class="current-price">${(stock.price || 0).toFixed(2)}</span>
                <span class="change-percent">${(stock.changePercent || 0).toFixed(2)}%</span>
            </div>
            <div class="stock-metrics">
                <div class="metric-item">
                    <span class="metric-label">PE:</span>
                    <span class="metric-value">${stock.pe ? stock.pe.toFixed(2) : '-'}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">PB:</span>
                    <span class="metric-value">${stock.pb ? stock.pb.toFixed(2) : '-'}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">ROE:</span>
                    <span class="metric-value">${stock.roe ? stock.roe.toFixed(1) : '-'}%</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">市值:</span>
                    <span class="metric-value">${this.formatMarketCap(stock.marketCap || 0)}</span>
                </div>
            </div>
            <div class="stock-industry">${stock.industry || '-'}</div>
        `;
        
        return card;
    }

    /**
     * 格式化市值显示
     */
    formatMarketCap(marketCap) {
        if (marketCap >= 100000000) {
            return (marketCap / 100000000).toFixed(2) + '亿';
        } else if (marketCap >= 10000) {
            return (marketCap / 10000).toFixed(2) + '万';
        }
        return marketCap.toString();
    }
}

/**
 * 初始化视觉特效
 */
function initVisualEffects() {
    // 确保DOM加载完成
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        // 创建并初始化视觉特效实例
        const visualEffects = new VisualEffects();
        visualEffects.init();
        
        // 将实例暴露给全局，便于其他模块使用
        window.visualEffects = visualEffects;
    } else {
        document.addEventListener('DOMContentLoaded', initVisualEffects);
    }
}

// 导出模块
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { VisualEffects, initVisualEffects };
} else if (typeof window !== 'undefined') {
    window.VisualEffects = VisualEffects;
    window.initVisualEffects = initVisualEffects;
}