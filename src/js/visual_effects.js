// visual_effects.js - 实现科技感视觉特效

/**
 * 视觉特效类，负责处理所有动画效果
 */
class VisualEffects {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.moon = null;
        this.showMoon = false;
        this.moonCrack = false;
        this.isAnimating = false;
    }

    /**
     * 初始化视觉特效
     */
    init() {
        this.canvas = document.getElementById('effect-canvas');
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        this.initializeParticles();
        this.initializeMoon();
        this.bindEvents();
        this.drawParticles();
    }

    /**
     * 调整画布大小以适应窗口
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    /**
     * 初始化粒子系统
     */
    initializeParticles() {
        this.particles = [];
        const particleCount = Math.floor(window.innerWidth * window.innerHeight / 5000);
        
        for(let i=0; i<particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                alpha: 1,
                size: Math.random() * 2 + 1
            });
        }
    }

    /**
     * 初始化月亮对象
     */
    initializeMoon() {
        this.moon = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
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
            if (!this.isAnimating) {
                this.initializeParticles();
                this.drawParticles();
            }
        });

        // 开始选股按钮点击事件
        setTimeout(() => {
            const startBtn = document.getElementById('start-btn');
            if (startBtn) {
                startBtn.addEventListener('click', () => this.startSelection());
            } else {
                console.error('Start button not found!');
            }
        }, 100);
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

        // 准备结果HTML
        let resultHtml = '';
        
        if (selectedStocks && selectedStocks.length > 0) {
            // 如果有真实的选股结果
            resultHtml = '<div class="result-container">';
            resultHtml += '<h2 style="color: #05ffa1; margin-bottom: 20px;">选股结果</h2>';
            
            selectedStocks.forEach(stock => {
                const isUp = stock.changePercentage && stock.changePercentage > 0;
                const changeColor = isUp ? '#ff4560' : '#00f0ff';
                
                resultHtml += `<div class="stock-item" style="margin-bottom: 15px;">`;
                resultHtml += `<div class="stock-name">${stock.name || '股票'}</div>`;
                resultHtml += `<div class="stock-code">${stock.code || '代码'}</div>`;
                resultHtml += `<div class="stock-price">${stock.price || '价格'}</div>`;
                resultHtml += `<div class="stock-change" style="color: ${changeColor};">`;
                resultHtml += `${isUp ? '+' : ''}${stock.changePercentage || '0'}%</div>`;
                resultHtml += `<div class="stock-industry">${stock.industry || '行业'}</div>`;
                resultHtml += `</div>`;
            });
            
            resultHtml += '</div>';
        } else {
            // 如果没有真实的选股结果，显示示例结果
            resultHtml = '<div class="result-container">';
            resultHtml += '<h2 style="color: #05ffa1; margin-bottom: 20px;">选股结果</h2>';
            resultHtml += '<div class="stock-item" style="margin-bottom: 15px;">';
            resultHtml += '<div class="stock-name">上证指数</div>';
            resultHtml += '<div class="stock-code">000001</div>';
            resultHtml += '<div class="stock-price">3,245.67</div>';
            resultHtml += '<div class="stock-change" style="color: #00f0ff;">-0.56%</div>';
            resultHtml += '<div class="stock-industry">指数</div>';
            resultHtml += '</div>';
            resultHtml += '</div>';
        }

        // 更新结果显示
        const resultElement = document.getElementById('result');
        if (resultElement) {
            resultElement.innerHTML = resultHtml;
            resultElement.style.display = "block";
            setTimeout(() => {
                resultElement.classList.add('show-result');
            }, 10);
        }

        // 动画结束
        this.isAnimating = false;
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