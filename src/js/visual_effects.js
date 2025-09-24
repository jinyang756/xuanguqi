// visual_effects.js - 实现科技感视觉特效
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

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('effect-canvas');
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    // 粒子螺旋参数
    let spiralParticles = [];
    let spiralStep = 0;
    let spiralMax = 400;
    let spiralRadius = Math.min(W, H) * 0.38;
    let spiralCenter = { x: W/2, y: H/2 };

    // 皓月碎裂参数
    let moon = { x: spiralCenter.x, y: spiralCenter.y, r: 0, alpha: 0 };
    let crackLines = [];
    let crackNodes = [];
    let showMoon = false, moonCrack = false, showData = false;

    // 股票数据示例
    const stockData = [
        { code: '600519', name: '贵州茅台' },
        { code: '000858', name: '五粮液' },
        { code: '300750', name: '宁德时代' },
        { code: '002594', name: '比亚迪' },
        { code: '601318', name: '中国平安' },
        { code: '000651', name: '格力电器' }
    ];

    // 初始化螺旋粒子
    function initSpiralParticles() {
        spiralParticles = [];
        for(let i=0; i<spiralMax; i++) {
            let angle = i * 0.18;
            let radius = spiralRadius * Math.sqrt(i/spiralMax);
            let x = spiralCenter.x + Math.cos(angle) * radius;
            let y = spiralCenter.y + Math.sin(angle) * radius;
            spiralParticles.push({
                x, y,
                alpha: 0.02 + 0.08 * Math.random(),
                targetAlpha: 0.7 + 0.3 * Math.random()
            });
        }
    }

    // 开场动画：粒子逐渐变亮
    function animateSpiralParticles() {
        ctx.clearRect(0,0,W,H);
        for(let p of spiralParticles) {
            if(p.alpha < p.targetAlpha) p.alpha += 0.008;
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.2, 0, Math.PI*2);
            ctx.fillStyle = "#00faff";
            ctx.shadowColor = "#00faff";
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.restore();
        }
        spiralStep++;
        if(spiralStep < 120) {
            requestAnimationFrame(animateSpiralParticles);
        } else {
            showMoon = true;
            animateMoon();
        }
    }

    // 皓月聚合动画
    function animateMoon() {
        ctx.clearRect(0,0,W,H);
        // 先绘制螺旋粒子
        for(let p of spiralParticles) {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.2, 0, Math.PI*2);
            ctx.fillStyle = "#00faff";
            ctx.shadowColor = "#00faff";
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.restore();
        }
        // 皓月出现
        moon.r += 2.5;
        moon.alpha += 0.03;
        ctx.save();
        ctx.globalAlpha = moon.alpha;
        ctx.beginPath();
        ctx.arc(moon.x, moon.y, moon.r, 0, Math.PI*2);
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.shadowColor = "#00faff";
        ctx.shadowBlur = 60;
        ctx.fill();
        ctx.restore();
        if(moon.r < 120) {
            requestAnimationFrame(animateMoon);
        } else {
            setTimeout(crackMoon, 700);
        }
    }

    // 皓月碎裂与能量扩散动画
    function crackMoon() {
        moonCrack = true;
        crackLines = [];
        crackNodes = [];
        let lineCount = stockData.length;
        for(let i=0; i<lineCount; i++) {
            let angle = (2*Math.PI/lineCount)*i + Math.random()*0.2;
            crackLines.push({
                angle,
                length: 0,
                maxLength: spiralRadius * 0.9 + Math.random()*40
            });
            crackNodes.push({
                angle,
                r: moon.r + 30,
                alpha: 0,
                stock: stockData[i]
            });
        }
        animateCrackLines();
    }

    // 放射状线条与节点动画
    function animateCrackLines() {
        ctx.clearRect(0,0,W,H);
        // 皓月淡出
        moon.alpha -= 0.03;
        ctx.save();
        ctx.globalAlpha = Math.max(moon.alpha, 0);
        ctx.beginPath();
        ctx.arc(moon.x, moon.y, moon.r, 0, Math.PI*2);
        ctx.fillStyle = "#fff";
        ctx.shadowColor = "#00faff";
        ctx.shadowBlur = 40;
        ctx.fill();
        ctx.restore();

        // 绘制放射状线条
        for(let i=0; i<crackLines.length; i++) {
            let line = crackLines[i];
            if(line.length < line.maxLength) line.length += 12;
            let x2 = moon.x + Math.cos(line.angle)*line.length;
            let y2 = moon.y + Math.sin(line.angle)*line.length;
            ctx.save();
            ctx.strokeStyle = "#00faff";
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.moveTo(moon.x, moon.y);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.restore();

            // 节点动画
            let node = crackNodes[i];
            node.r = moon.r + line.length;
            node.alpha = Math.min(1, line.length/line.maxLength);
            let nx = moon.x + Math.cos(node.angle)*node.r;
            let ny = moon.y + Math.sin(node.angle)*node.r;
            ctx.save();
            ctx.globalAlpha = node.alpha;
            ctx.beginPath();
            ctx.arc(nx, ny, 18, 0, Math.PI*2);
            ctx.fillStyle = "#00faff";
            ctx.shadowColor = "#00faff";
            ctx.shadowBlur = 18;
            ctx.fill();
            ctx.restore();

            // 绘制股票代码/名称
            ctx.save();
            ctx.globalAlpha = node.alpha;
            ctx.fillStyle = "#fff";
            ctx.font = "bold 16px 'Consolas', '微软雅黑'";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(node.stock.code, nx, ny-10);
            ctx.font = "12px '微软雅黑'";
            ctx.fillText(node.stock.name, nx, ny+10);
            ctx.restore();
        }

        // 判断动画结束
        if(moon.alpha > 0.1 || crackLines.some(l => l.length < l.maxLength)) {
            requestAnimationFrame(animateCrackLines);
        } else {
            setTimeout(showResult, 800);
        }
    }

    // 展示选股结果
    function showResult() {
        ctx.clearRect(0,0,W,H);
        const resultDiv = document.getElementById('result');
        const resultList = resultDiv.querySelector('.result-list');
        resultList.innerHTML = stockData.map(s => `<div>${s.code} ${s.name}</div>`).join('');
        resultDiv.style.display = "block";
        // 皓月动画首尾呼应
        resultDiv.querySelector('.result-moon').style.animation = "moonAppear 1.2s cubic-bezier(.7,.2,.3,1)";
    }

    // 绑定按钮事件
    document.getElementById('start-btn').onclick = function() {
        document.getElementById('result').style.display = "none";
        spiralStep = 0;
        moon.r = 0;
        moon.alpha = 0;
        showMoon = false;
        moonCrack = false;
        showData = false;
        initSpiralParticles();
        animateSpiralParticles();
    };

    // 初始动画
    initSpiralParticles();
    animateSpiralParticles();

    // 响应窗口大小变化
    window.addEventListener('resize', () => {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;
        spiralCenter.x = W/2;
        spiralCenter.y = H/2;
        moon.x = spiralCenter.x;
        moon.y = spiralCenter.y;
        if(!showMoon && !moonCrack) {
            initSpiralParticles();
            animateSpiralParticles();
        }
    });
});