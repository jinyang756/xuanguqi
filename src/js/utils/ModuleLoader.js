/**
 * ModuleLoader.js
 * 模块加载器，负责管理应用中的各个模块
 */

/**
 * 模块加载器类
 */
export class ModuleLoader {
    constructor() {
        this.modules = {};
    }

    /**
     * 加载模块
     * @param {string} name - 模块名称
     * @param {Function} factory - 模块工厂函数
     * @returns {*} 模块实例
     */
    register(name, factory) {
        if (!this.modules[name]) {
            try {
                this.modules[name] = factory();
                console.log(`模块 ${name} 已注册`);
            } catch (error) {
                console.error(`模块 ${name} 注册失败:`, error);
                // 返回null或默认值，防止应用崩溃
                this.modules[name] = null;
            }
        }
        return this.modules[name];
    }

    /**
     * 获取已加载的模块
     * @param {string} name - 模块名称
     * @returns {*} 模块实例
     */
    get(name) {
        if (!this.modules[name]) {
            console.warn(`模块 ${name} 尚未加载`);
        }
        return this.modules[name];
    }

    /**
     * 检查模块是否已加载
     * @param {string} name - 模块名称
     * @returns {boolean} 是否已加载
     */
    isLoaded(name) {
        return !!this.modules[name];
    }

    /**
     * 获取所有已加载的模块
     * @returns {Object} 所有模块
     */
    getAll() {
        return { ...this.modules };
    }

    /**
     * 移除模块
     * @param {string} name - 模块名称
     * @returns {boolean} 是否移除成功
     */
    remove(name) {
        if (this.modules[name]) {
            // 调用模块的destroy方法（如果存在）
            if (typeof this.modules[name].destroy === 'function') {
                try {
                    this.modules[name].destroy();
                } catch (error) {
                    console.error(`模块 ${name} 销毁失败:`, error);
                }
            }
            delete this.modules[name];
            console.log(`模块 ${name} 已移除`);
            return true;
        }
        return false;
    }

    /**
     * 重新加载模块
     * @param {string} name - 模块名称
     * @param {Function} factory - 模块工厂函数
     * @returns {*} 新的模块实例
     */
    reload(name, factory) {
        this.remove(name);
        return this.register(name, factory);
    }

    /**
     * 清除所有模块
     */
    clear() {
        Object.keys(this.modules).forEach(name => this.remove(name));
    }

    /**
     * 获取已加载模块的数量
     * @returns {number} 模块数量
     */
    getModuleCount() {
        return Object.keys(this.modules).length;
    }
}