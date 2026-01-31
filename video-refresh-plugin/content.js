class VideoRefreshManager {
    constructor() {
        this.settings = {
            refreshInterval: 60,
            videoSelectors: 'video, .video, .video-container',
            autoRefresh: false
        };
        this.refreshTimer = null;
        this.lastRefreshTime = 0;
        
        this.init();
    }
    
    async init() {
        // 加载存储的设置
        const storedSettings = await chrome.storage.sync.get(['refreshInterval', 'videoSelectors', 'autoRefresh']);
        Object.assign(this.settings, storedSettings);
        
        // 监听消息
        this.setupMessageListener();
        
        // 开始自动刷新
        if (this.settings.autoRefresh) {
            this.startAutoRefresh();
        }
        
        // 监听页面滚动，用于暂停/恢复视频
        this.setupScrollListener();
    }
    
    setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'UPDATE_SETTINGS') {
                this.updateSettings(message.settings);
                sendResponse({ success: true });
            } else if (message.type === 'GET_STATUS') {
                sendResponse({ 
                    isActive: this.settings.autoRefresh,
                    lastRefresh: this.lastRefreshTime,
                    videoCount: this.getVideoCount()
                });
            } else if (message.type === 'MANUAL_REFRESH') {
                this.refreshVideos();
                sendResponse({ success: true });
            }
        });
    }
    
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        
        if (this.settings.autoRefresh) {
            this.startAutoRefresh();
        } else {
            this.stopAutoRefresh();
        }
    }
    
    startAutoRefresh() {
        this.stopAutoRefresh(); // 确保只运行一个定时器
        
        this.refreshTimer = setInterval(() => {
            this.refreshVideos();
        }, this.settings.refreshInterval * 1000);
        
        console.log('视频自动刷新已启动，间隔:', this.settings.refreshInterval, '秒');
    }
    
    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
            console.log('视频自动刷新已停止');
        }
    }
    
    refreshVideos() {
        const videos = this.findVideos();
        
        if (videos.length > 0) {
            videos.forEach((video, index) => {
                // 停止当前播放
                video.pause();
                video.currentTime = 0;
                
                // 重新加载并播放
                video.load();
                
                // 添加延迟确保视频重新加载
                setTimeout(() => {
                    try {
                        video.play().catch(error => {
                            console.log('自动播放被阻止:', error);
                        });
                    } catch (e) {
                        console.log('播放视频时出错:', e);
                    }
                }, index * 500);
            });
            
            this.lastRefreshTime = Date.now();
            console.log('已刷新', videos.length, '个视频');
        }
    }
    
    findVideos() {
        const selectors = this.settings.videoSelectors.split(',');
        const videos = [];
        
        selectors.forEach(selector => {
            selector = selector.trim();
            if (!selector) return;
            
            // 查找视频元素
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element.tagName === 'VIDEO') {
                    videos.push(element);
                } else {
                    // 在容器中查找视频元素
                    const videoElements = element.querySelectorAll('video');
                    videoElements.forEach(video => {
                        if (!videos.includes(video)) {
                            videos.push(video);
                        }
                    });
                }
            });
        });
        
        return videos;
    }
    
    getVideoCount() {
        return this.findVideos().length;
    }
    
    setupScrollListener() {
        let lastScrollTop = 0;
        const scrollThreshold = 100;
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (Math.abs(scrollTop - lastScrollTop) > scrollThreshold) {
                // 页面滚动超过阈值，暂停所有视频
                this.findVideos().forEach(video => {
                    video.pause();
                });
                lastScrollTop = scrollTop;
            }
        });
    }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new VideoRefreshManager();
    });
} else {
    new VideoRefreshManager();
}

// 暴露一些调试方法
window.getVideoCount = () => {
    const manager = window.__videoRefreshManager;
    return manager ? manager.getVideoCount() : 0;
};

window.manualRefresh = () => {
    const manager = window.__videoRefreshManager;
    if (manager) {
        manager.refreshVideos();
    }
};
