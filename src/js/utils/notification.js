/**
 * notification.js
 * 通知系统，用于显示各种类型的消息提示
 */

/**
 * 创建通知元素
 * @param {string} message - 通知消息内容
 * @param {string} type - 通知类型 (info, success, warning, error)
 * @param {Object} options - 配置选项
 * @returns {HTMLElement} 通知元素
 */
export function createNotification(message, type = 'info', options = {}) {
    // 默认配置
    const defaultOptions = {
        duration: 3000, // 默认显示时间（毫秒）
        position: 'top-right', // 显示位置
        showCloseButton: true, // 是否显示关闭按钮
        onClick: null, // 点击通知的回调函数
        onClose: null // 关闭通知的回调函数
    };

    // 合并配置
    const config = { ...defaultOptions, ...options };

    // 创建通知容器
    if (!document.querySelector('.notifications-container')) {
        const container = document.createElement('div');
        container.className = 'notifications-container';
        document.body.appendChild(container);
    }

    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} notification-${config.position}`;
    notification.dataset.type = type;

    // 设置消息内容
    notification.innerHTML = `
        <div class="notification-content">${message}</div>
        ${config.showCloseButton ? '<button class="notification-close">&times;</button>' : ''}
    `;

    // 添加到容器
    const container = document.querySelector('.notifications-container');
    container.appendChild(notification);

    // 添加进入动画
    setTimeout(() => {
        notification.classList.add('notification-visible');
    }, 10);

    // 添加点击事件
    if (typeof config.onClick === 'function') {
        notification.addEventListener('click', (e) => {
            if (!e.target.classList.contains('notification-close')) {
                config.onClick(notification);
            }
        });
    }

    // 添加关闭按钮事件
    if (config.showCloseButton) {
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            closeNotification(notification, config.onClose);
        });
    }

    // 设置自动关闭
    let autoCloseTimer;
    if (config.duration > 0) {
        autoCloseTimer = setTimeout(() => {
            closeNotification(notification, config.onClose);
        }, config.duration);

        // 鼠标悬停时暂停自动关闭
        notification.addEventListener('mouseenter', () => {
            if (autoCloseTimer) {
                clearTimeout(autoCloseTimer);
            }
        });

        // 鼠标离开时继续自动关闭
        notification.addEventListener('mouseleave', () => {
            if (config.duration > 0) {
                autoCloseTimer = setTimeout(() => {
                    closeNotification(notification, config.onClose);
                }, config.duration);
            }
        });
    }

    return notification;
}

/**
 * 关闭通知
 * @param {HTMLElement} notification - 通知元素
 * @param {Function} onClose - 关闭回调函数
 */
function closeNotification(notification, onClose) {
    if (!notification || !notification.parentNode) {
        return;
    }

    // 添加退出动画
    notification.classList.remove('notification-visible');
    notification.classList.add('notification-hidden');

    // 动画结束后移除元素
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }

        // 调用回调函数
        if (typeof onClose === 'function') {
            onClose(notification);
        }

        // 如果没有通知了，移除容器
        const container = document.querySelector('.notifications-container');
        if (container && container.children.length === 0) {
            document.body.removeChild(container);
        }
    }, 300);
}

/**
 * 显示成功通知
 * @param {string} message - 消息内容
 * @param {Object} options - 配置选项
 * @returns {HTMLElement} 通知元素
 */
export function showSuccessNotification(message, options = {}) {
    return createNotification(message, 'success', options);
}

/**
 * 显示错误通知
 * @param {string} message - 消息内容
 * @param {Object} options - 配置选项
 * @returns {HTMLElement} 通知元素
 */
export function showErrorNotification(message, options = {}) {
    // 错误通知默认显示时间更长
    const config = { duration: 5000, ...options };
    return createNotification(message, 'error', config);
}

/**
 * 显示警告通知
 * @param {string} message - 消息内容
 * @param {Object} options - 配置选项
 * @returns {HTMLElement} 通知元素
 */
export function showWarningNotification(message, options = {}) {
    return createNotification(message, 'warning', options);
}

/**
 * 显示信息通知
 * @param {string} message - 消息内容
 * @param {Object} options - 配置选项
 * @returns {HTMLElement} 通知元素
 */
export function showInfoNotification(message, options = {}) {
    return createNotification(message, 'info', options);
}

/**
 * 关闭所有通知
 */
export function closeAllNotifications() {
    const notifications = document.querySelectorAll('.notification');
    notifications.forEach(notification => {
        closeNotification(notification);
    });
}

/**
 * 获取当前通知数量
 * @returns {number} 通知数量
 */
export function getNotificationCount() {
    const notifications = document.querySelectorAll('.notification');
    return notifications.length;
}

/**
 * 初始化通知样式
 * 这个函数会在页面中添加必要的CSS样式
 */
export function initNotificationStyles() {
    // 检查样式是否已经存在
    if (document.getElementById('notification-styles')) {
        return;
    }

    // 创建样式元素
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .notifications-container {
            position: fixed;
            z-index: 9999;
            max-width: 350px;
        }

        .notifications-container.top-right {
            top: 20px;
            right: 20px;
        }

        .notifications-container.top-left {
            top: 20px;
            left: 20px;
        }

        .notifications-container.bottom-right {
            bottom: 20px;
            right: 20px;
        }

        .notifications-container.bottom-left {
            bottom: 20px;
            left: 20px;
        }

        .notification {
            position: relative;
            padding: 15px 20px;
            margin-bottom: 10px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            color: #fff;
            font-size: 14px;
            line-height: 1.4;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
            cursor: pointer;
            overflow: hidden;
        }

        .notification-visible {
            opacity: 1;
            transform: translateY(0);
        }

        .notification-hidden {
            opacity: 0;
            transform: translateX(100%);
        }

        .notification-info {
            background-color: #3498db;
        }

        .notification-success {
            background-color: #2ecc71;
        }

        .notification-warning {
            background-color: #f39c12;
        }

        .notification-error {
            background-color: #e74c3c;
        }

        .notification-content {
            margin-right: 25px;
        }

        .notification-close {
            position: absolute;
            top: 50%;
            right: 10px;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: inherit;
            font-size: 18px;
            cursor: pointer;
            padding: 5px;
            line-height: 1;
            opacity: 0.8;
            transition: opacity 0.2s;
        }

        .notification-close:hover {
            opacity: 1;
        }

        @media (max-width: 768px) {
            .notifications-container {
                max-width: calc(100% - 40px);
            }
        }
    `;

    // 添加到文档头部
    document.head.appendChild(style);
}

// 自动初始化通知样式
initNotificationStyles();