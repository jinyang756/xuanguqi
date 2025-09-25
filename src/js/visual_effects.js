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
        if (!this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制所有粒子
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
            
            // 更新位置
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // 边界检测
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.vx *= -1;
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.vy *= -1;
            }
        });
        
        // 连接附近的粒子
        this.connectParticles();
        
        // 继续动画
        requestAnimationFrame(() => this.drawBasicParticles());
    }

    /**
     * 连接附近的粒子
     */
    connectParticles() {
        const threshold = 150;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < threshold) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(128, 128, 128, ${(threshold - distance) / threshold * 0.4})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }

    /**
     * 初始化月亮对象
     */
    initializeMoon() {
        this.moon = {
            x: this.canvas ? this.canvas.width / 2 : window.innerWidth / 2,
            y: this.canvas ? this.canvas.height / 2 : window.innerHeight / 2,
            r: 0,
            alpha: 0
        };
        this.showMoon = false;
        this.moonCrack = false;
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
     * 动画：粒子飞向月亮
     */
    animateParticlesToMoon() {
        if (!this.isAnimating) return;

        // 更新粒子位置
        for(let p of this.particles) {
            let dx = this.moon.x - p.x;
            let dy = this.moon.y - p.y;
            p.x += dx * 0.02;
            p.y += dy * 0.02;
            p.alpha -= 0.005;
        }

        this.drawParticles();

        // 检查是否应该显示月亮
        if(this.particles[0].alpha < 0.2) {
            this.showMoon = true;
        }

        if(!this.showMoon) {
            requestAnimationFrame(() => this.animateParticlesToMoon());
        } else {
            this.animateMoon();
        }
    }

    /**
     * 动画：显示月亮
     */
    animateMoon() {
        if (!this.isAnimating) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        
        // 更新月亮属性
        this.moon.r += 2;
        this.moon.alpha += 0.02;
        
        // 绘制月亮
        this.ctx.globalAlpha = this.moon.alpha;
        this.ctx.beginPath();
        this.ctx.arc(this.moon.x, this.moon.y, this.moon.r, 0, Math.PI * 2);
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        this.ctx.shadowColor = "#00faff";
        this.ctx.shadowBlur = 40;
        this.ctx.fill();
        
        this.ctx.restore();

        if(this.moon.r < 120) {
            requestAnimationFrame(() => this.animateMoon());
        } else {
            // 月亮达到最大大小后，延迟碎裂
            setTimeout(() => this.crackMoon(), 800);
        }
    }

    /**
     * 动画：月亮碎裂
     */
    crackMoon() {
        if (!this.isAnimating) return;

        this.moonCrack = true;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 月亮碎裂动画（简化为淡出效果）
        let crackAlpha = this.moon.alpha;
        
        function fadeMoon() {
            if (!this.isAnimating) return;
            
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.save();
            
            crackAlpha -= 0.04;
            this.ctx.globalAlpha = crackAlpha;
            
            // 绘制淡出的月亮
            this.ctx.beginPath();
            this.ctx.arc(this.moon.x, this.moon.y, this.moon.r, 0, Math.PI * 2);
            this.ctx.fillStyle = "#fff";
            this.ctx.shadowColor = "#00faff";
            this.ctx.shadowBlur = 40;
            this.ctx.fill();
            
            this.ctx.restore();
            
            if(crackAlpha > 0) {
                requestAnimationFrame(() => fadeMoon.call(this));
            } else {
                // 显示选股结果
                this.showResult();
            }
        }
        
        fadeMoon.call(this);
    }

    /**
     * 显示选股结果
     */
    showResult() {
        // 获取选股结果
        const app = window.app;
        const stockSelector = window.stockSelector;
        let selectedStocks = null;
        
        try {
            // 尝试调用选股器获取结果
            if (stockSelector && typeof stockSelector.selectStocksForShortTermGrowth === 'function') {
                selectedStocks = stockSelector.selectStocksForShortTermGrowth(3);
            }
        } catch (error) {
            console.error('Error getting stock selection:', error);
        }

        // 创建结果容器
        const resultElement = document.getElementById('result');
        if (!resultElement) {
            // 动画结束
            this.isAnimating = false;
            return;
        }

        // 清空现有内容并设置容器样式
        resultElement.innerHTML = '';
        resultElement.style.display = 'block';
        resultElement.style.opacity = '0';
        resultElement.style.transform = 'translateY(20px)';
        resultElement.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

        // 添加标题
        const title = document.createElement('h2');
        title.textContent = '选股结果';
        title.style.color = '#05ffa1';
        title.style.marginBottom = '40px';
        title.style.textAlign = 'center';
        resultElement.appendChild(title);

        // 添加自定义样式
        const style = document.createElement('style');
        style.textContent = `
            .stock-card {
                background: rgba(0, 24, 59, 0.85);
                border: 2px solid #05ffa1;
                border-radius: 15px;
                padding: 30px;
                margin: 20px auto;
                max-width: 800px;
                box-shadow: 0 0 20px rgba(5, 255, 161, 0.3);
                opacity: 0;
                transform: translateY(50px);
                transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
                overflow: hidden;
                position: relative;
            }
            
            .stock-card.show {
                opacity: 1;
                transform: translateY(0);
            }
            
            .stock-card::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(
                    45deg,
                    transparent 0%,
                    rgba(5, 255, 161, 0.1) 50%,
                    transparent 100%
                );
                transform: rotate(45deg);
                animation: shine 4s infinite;
            }
            
            @keyframes shine {
                0% { transform: translateX(-100%) rotate(45deg); }
                100% { transform: translateX(100%) rotate(45deg); }
            }
            
            .stock-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }
            
            .stock-name {
                color: #05ffa1;
                font-size: 32px;
                font-weight: bold;
            }
            
            .stock-code {
                color: #b0b0b0;
                font-size: 18px;
            }
            
            .stock-data {
                display: flex;
                justify-content: space-around;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }
            
            .data-item {
                flex: 1;
                min-width: 100px;
                text-align: center;
                margin: 10px 0;
            }
            
            .data-label {
                color: #b0b0b0;
                font-size: 14px;
                margin-bottom: 5px;
            }
            
            .data-value {
                font-size: 28px;
                font-weight: bold;
            }
            
            .data-value.positive {
                color: #05ffa1;
            }
            
            .data-value.negative {
                color: #ff4560;
            }
            
            .data-value.neutral {
                color: #ffffff;
            }
        `;
        document.head.appendChild(style);

        // 显示容器动画
        setTimeout(() => {
            resultElement.style.opacity = '1';
            resultElement.style.transform = 'translateY(0)';
        }, 100);

        // 准备股票数据
        let stocksToShow = [];
        
        try {
            // 首先尝试调用app.performStockSelection()获取真实选股结果
            if (app && typeof app.performStockSelection === 'function') {
                // 直接调用选股逻辑获取结果
                const resultData = this.getStockDataFromApp();
                if (resultData && resultData.length > 0) {
                    stocksToShow = resultData;
                }
            }
        } catch (error) {
            console.error('获取真实选股结果失败，使用示例数据:', error);
        }
        
        // 如果没有真实的选股结果，使用示例数据
        if (stocksToShow.length === 0) {
            stocksToShow = [
                { name: '上证指数', code: '000001', price: '3,245.67', changePercentage: -0.56, industry: '指数', score: 75 },
                { name: '贵州茅台', code: '600519', price: '1,898.00', changePercentage: 1.25, industry: '白酒', score: 92 },
                { name: '腾讯控股', code: '00700', price: '385.80', changePercentage: -0.85, industry: '互联网', score: 85 }
            ];
        }

        // 动态创建并添加股票卡片，实现逐条飞入效果
        stocksToShow.forEach((stock, index) => {
            setTimeout(() => {
                const card = this.createStockCard(stock);
                resultElement.appendChild(card);
                
                // 触发动画
                setTimeout(() => {
                    card.classList.add('show');
                }, 10);
            }, 300 * (index + 1)); // 每条卡片间隔300ms出现
        });

        // 显示已有的操作按钮
        setTimeout(() => {
            const startBtn = document.getElementById('start-btn');
            const restartBtn = document.getElementById('restart-btn');
            const homeBtn = document.getElementById('home-btn');
            const trackBtn = document.getElementById('track-btn');
            
            // 如果主开始按钮存在，启用它
            if (startBtn) {
                startBtn.disabled = false;
                startBtn.style.opacity = '1';
            }
            
            // 显示并设置结果区域的按钮
            if (restartBtn) {
                restartBtn.style.display = 'inline-block';
                restartBtn.style.opacity = '0';
                restartBtn.style.transform = 'translateY(30px)';
                restartBtn.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                
                // 添加动画和交互效果
                restartBtn.addEventListener('mouseover', function() {
                    this.style.transform = 'scale(1.05)';
                    this.style.boxShadow = '0 0 25px rgba(5, 255, 161, 0.8)';
                });
                
                restartBtn.addEventListener('mouseout', function() {
                    this.style.transform = 'scale(1)';
                    this.style.boxShadow = '0 0 15px rgba(5, 255, 161, 0.5)';
                });
                
                // 确保只绑定一次点击事件
                const newRestartBtn = restartBtn.cloneNode(true);
                restartBtn.parentNode.replaceChild(newRestartBtn, restartBtn);
                newRestartBtn.addEventListener('click', () => {
                    // 防止重复点击
                    if (this.isAnimating) return;
                    window.location.reload(); // 重新加载页面以开始新的选股
                });
                
                // 触发显示动画
                setTimeout(() => {
                    newRestartBtn.style.opacity = '1';
                    newRestartBtn.style.transform = 'translateY(0)';
                }, 10);
            }
            
            if (homeBtn) {
                homeBtn.style.display = 'inline-block';
                homeBtn.style.opacity = '0';
                homeBtn.style.transform = 'translateY(30px)';
                homeBtn.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                
                setTimeout(() => {
                    homeBtn.style.opacity = '1';
                    homeBtn.style.transform = 'translateY(0)';
                }, 10);
            }
            
            if (trackBtn) {
                trackBtn.style.display = 'inline-block';
                trackBtn.style.opacity = '0';
                trackBtn.style.transform = 'translateY(30px)';
                trackBtn.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                
                setTimeout(() => {
                    trackBtn.style.opacity = '1';
                    trackBtn.style.transform = 'translateY(0)';
                }, 10);
            }
        }, 1500);

        // 动画结束
        setTimeout(() => {
            this.isAnimating = false;
        }, 2000);
    }
    
    /**
     * 从app实例获取股票数据
     * @returns {Array} 股票数据数组
     */
    getStockDataFromApp() {
        const app = window.app;
        const stockSelector = window.stockSelector;
        
        try {
            // 尝试从stockSelector获取数据
            if (stockSelector && stockSelector.getCleanedData) {
                const cleanedData = stockSelector.getCleanedData();
                
                // 尝试使用当前选中的策略进行选股
                let selectedStocks = [];
                const activeStrategy = this.getActiveStrategy();
                
                switch(activeStrategy) {
                    case 'breakout':
                        if (stockSelector.breakoutStrategy) {
                            selectedStocks = stockSelector.breakoutStrategy(cleanedData);
                        }
                        break;
                    case 'shortTermGrowth':
                        if (stockSelector.selectStockForShortTermGrowth) {
                            selectedStocks = stockSelector.selectStockForShortTermGrowth();
                        } else if (stockSelector.selectStocksForShortTermGrowth) {
                            selectedStocks = stockSelector.selectStocksForShortTermGrowth(3);
                        }
                        break;
                    default:
                        if (stockSelector.selectStockForShortTermGrowth) {
                            selectedStocks = stockSelector.selectStockForShortTermGrowth();
                        } else if (stockSelector.selectStocksForShortTermGrowth) {
                            selectedStocks = stockSelector.selectStocksForShortTermGrowth(3);
                        }
                }
                
                return selectedStocks;
            }
        } catch (error) {
            console.error('获取股票数据失败:', error);
        }
        
        return [];
    }
    
    /**
     * 获取当前选中的策略
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
     * 创建股票卡片
     */
    createStockCard(stock) {
        const card = document.createElement('div');
        card.className = 'stock-card';
        
        // 股票头部信息
        const header = document.createElement('div');
        header.className = 'stock-header';
        
        const name = document.createElement('div');
        name.className = 'stock-name';
        name.textContent = stock.name || '股票';
        
        const code = document.createElement('div');
        code.className = 'stock-code';
        code.textContent = stock.code || '代码';
        
        header.appendChild(name);
        header.appendChild(code);
        
        // 股票数据
        const dataContainer = document.createElement('div');
        dataContainer.className = 'stock-data';
        
        // 价格数据
        const priceItem = document.createElement('div');
        priceItem.className = 'data-item';
        priceItem.innerHTML = `
            <div class="data-label">最新价</div>
            <div class="data-value neutral">${stock.price || '0.00'}</div>
        `;
        
        // 涨跌幅数据
        const changeItem = document.createElement('div');
        changeItem.className = 'data-item';
        const isPositive = stock.changePercentage && stock.changePercentage > 0;
        const changeValue = stock.changePercentage || 0;
        const changeClass = isPositive ? 'positive' : 'negative';
        const changeText = isPositive ? `+${changeValue.toFixed(2)}%` : `${changeValue.toFixed(2)}%`;
        
        changeItem.innerHTML = `
            <div class="data-label">涨跌幅</div>
            <div class="data-value ${changeClass}">${changeText}</div>
        `;
        
        // 评分数据
        const scoreItem = document.createElement('div');
        scoreItem.className = 'data-item';
        scoreItem.innerHTML = `
            <div class="data-label">AI评分</div>
            <div class="data-value positive">${stock.score ? stock.score.toFixed(0) : '0'}</div>
        `;
        
        // 行业数据
        const industryItem = document.createElement('div');
        industryItem.className = 'data-item';
        industryItem.innerHTML = `
            <div class="data-label">行业</div>
            <div class="data-value neutral">${stock.industry || '未知'}</div>
        `;
        
        dataContainer.appendChild(priceItem);
        dataContainer.appendChild(changeItem);
        dataContainer.appendChild(scoreItem);
        dataContainer.appendChild(industryItem);
        
        // 组装卡片
        card.appendChild(header);
        card.appendChild(dataContainer);
        
        return card;
    }
}

// 当窗口加载完成时初始化视觉特效
function initVisualEffects() {
    try {
        const visualEffects = new VisualEffects();
        visualEffects.init();
        
        // 将视觉特效对象暴露到全局，方便其他脚本调用
        window.visualEffects = visualEffects;
    } catch (error) {
        console.error('Error initializing visual effects:', error);
    }
}

// 确保DOM加载完成后再初始化
if (document.readyState === 'complete') {
    // 如果页面已经加载完成，直接初始化
    initVisualEffects();
} else {
    // 否则监听加载完成事件
    window.addEventListener('load', initVisualEffects);
}

// 初始化视觉特效系统
// 注意：index.html中已经有DOMContentLoaded事件监听器来初始化VisualEffects类，
// 这里保留额外的初始化逻辑以确保视觉特效能够正常加载

// 导出VisualEffects类 - 支持CommonJS和全局变量
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = VisualEffects;
}
if (typeof window !== 'undefined') {
    window.VisualEffects = VisualEffects;
}

// 为了支持动态导入，确保VisualEffects可在全局作用域访问
self.VisualEffects = VisualEffects;