/*
 * index.js - 前端模块化入口文件
 * 整合所有JavaScript模块，提供统一的API接口
 */

import '../css/main.css';
import AppInitializer from './app/AppInitializer.js';
import { initParticles } from './utils/particles.js';

// 主入口函数
function main() {
    // 初始化粒子背景
    initParticles();
    
    // 初始化应用
    const app = new AppInitializer();
    app.init();
    
    // 全局导出应用实例
    window.app = app;
    
    return app;
}

// 当DOM加载完成后初始化应用
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    main();
} else {
    document.addEventListener('DOMContentLoaded', main);
}