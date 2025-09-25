/**
 * particles.js
 * 粒子背景效果实现
 */

/**
 * 初始化粒子背景
 * @param {Object} options - 配置选项
 */
export function initParticles(options = {}) {
    // 确保页面已经加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            createParticles(options);
        });
    } else {
        createParticles(options);
    }
}

/**
 * 创建粒子背景
 * @param {Object} options - 配置选项
 */
function createParticles(options) {
    // 检查particles.js库是否已加载
    if (typeof particlesJS === 'undefined') {
        console.warn('particles.js库尚未加载，粒子背景无法初始化');
        // 尝试动态加载particles.js库
        loadParticlesJS(() => {
            initializeParticles(options);
        });
        return;
    }

    initializeParticles(options);
}

/**
 * 动态加载particles.js库
 * @param {Function} callback - 加载完成后的回调函数
 */
function loadParticlesJS(callback) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
    script.onload = callback;
    script.onerror = () => {
        console.error('particles.js库加载失败');
    };
    document.head.appendChild(script);
}

/**
 * 初始化粒子系统
 * @param {Object} options - 配置选项
 */
function initializeParticles(options) {
    // 默认配置
    const defaultConfig = {
        particles: {
            number: {
                value: 80,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: '#1abc9c'
            },
            shape: {
                type: 'circle',
                stroke: {
                    width: 0,
                    color: '#000000'
                }
            },
            opacity: {
                value: 0.5,
                random: true,
                anim: {
                    enable: true,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    enable: false,
                    speed: 40,
                    size_min: 0.1,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#1abc9c',
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 2,
                direction: 'none',
                random: true,
                straight: false,
                out_mode: 'out',
                bounce: false,
                attract: {
                    enable: false,
                    rotateX: 600,
                    rotateY: 1200
                }
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: {
                    enable: true,
                    mode: 'grab'
                },
                onclick: {
                    enable: true,
                    mode: 'push'
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 140,
                    line_linked: {
                        opacity: 1
                    }
                },
                bubble: {
                    distance: 400,
                    size: 40,
                    duration: 2,
                    opacity: 8,
                    speed: 3
                },
                repulse: {
                    distance: 200,
                    duration: 0.4
                },
                push: {
                    particles_nb: 4
                },
                remove: {
                    particles_nb: 2
                }
            }
        },
        retina_detect: true
    };

    // 合并用户配置
    const config = { ...defaultConfig, ...options };

    // 创建粒子容器
    const container = document.getElementById('particles-js');
    if (!container) {
        console.warn('粒子容器未找到');
        return;
    }

    // 初始化粒子系统
    try {
        particlesJS('particles-js', config);
        console.log('粒子背景初始化完成');
    } catch (error) {
        console.error('粒子背景初始化失败:', error);
    }
}

/**
 * 暂停粒子动画
 */
export function pauseParticles() {
    if (window.pJSDom && window.pJSDom.length > 0) {
        window.pJSDom[0].pJS.particles.move.enable = false;
    }
}

/**
 * 恢复粒子动画
 */
export function resumeParticles() {
    if (window.pJSDom && window.pJSDom.length > 0) {
        window.pJSDom[0].pJS.particles.move.enable = true;
    }
}

/**
 * 销毁粒子系统
 */
export function destroyParticles() {
    if (window.pJSDom && window.pJSDom.length > 0) {
        window.pJSDom[0].pJS.fn.vendors.destroypJS();
        window.pJSDom = [];
    }
}

/**
 * 更新粒子配置
 * @param {Object} newConfig - 新的配置
 */
export function updateParticlesConfig(newConfig) {
    if (window.pJSDom && window.pJSDom.length > 0) {
        // 销毁旧的粒子系统
        destroyParticles();
        // 创建新的粒子系统
        createParticles(newConfig);
    }
}

/**
 * 获取当前粒子数量
 * @returns {number} 粒子数量
 */
export function getParticleCount() {
    if (window.pJSDom && window.pJSDom.length > 0) {
        return window.pJSDom[0].pJS.particles.array.length;
    }
    return 0;
}

/**
 * 粒子动画控制器类
 */
export class ParticleController {
    constructor() {
        this.isInitialized = false;
        this.isPaused = false;
    }

    /**
     * 初始化粒子系统
     * @param {Object} options - 配置选项
     */
    init(options = {}) {
        if (!this.isInitialized) {
            initParticles(options);
            this.isInitialized = true;
            this.isPaused = false;
        }
    }

    /**
     * 暂停粒子动画
     */
    pause() {
        if (!this.isPaused) {
            pauseParticles();
            this.isPaused = true;
        }
    }

    /**
     * 恢复粒子动画
     */
    resume() {
        if (this.isPaused) {
            resumeParticles();
            this.isPaused = false;
        }
    }

    /**
     * 切换粒子动画状态
     */
    toggle() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }

    /**
     * 销毁粒子系统
     */
    destroy() {
        if (this.isInitialized) {
            destroyParticles();
            this.isInitialized = false;
            this.isPaused = false;
        }
    }

    /**
     * 更新粒子配置
     * @param {Object} newConfig - 新的配置
     */
    updateConfig(newConfig) {
        updateParticlesConfig(newConfig);
    }

    /**
     * 获取当前状态
     * @returns {Object} 状态对象
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isPaused: this.isPaused,
            particleCount: getParticleCount()
        };
    }
}