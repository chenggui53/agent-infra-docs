// 监听安装事件
chrome.runtime.onInstalled.addListener((details) => {
    console.log('视频自动刷新插件已安装');
    
    // 设置默认值
    chrome.storage.sync.get(['refreshInterval', 'videoSelectors', 'autoRefresh'], (result) => {
        if (!result.refreshInterval) {
            chrome.storage.sync.set({
                refreshInterval: 60,
                videoSelectors: 'video, .video, .video-container',
                autoRefresh: false
            });
        }
    });
});

// 监听启动事件
chrome.runtime.onStartup.addListener(() => {
    console.log('插件启动');
});

// 监听标签页创建
chrome.tabs.onCreated.addListener((tab) => {
    console.log('标签页创建:', tab.id);
});

// 监听标签页更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
        console.log('页面加载完成:', tab.url);
    }
});

// 浏览器动作事件监听器
chrome.action.onClicked.addListener((tab) => {
    console.log('插件图标点击');
});

// 消息监听器
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'LOG' && sender.tab) {
        console.log(`[${sender.tab.url}] ${message.content}`);
    }
});

// 存储变化监听器
chrome.storage.sync.onChanged.addListener((changes, namespace) => {
    console.log('存储变化:', changes);
});

// 定期检查插件状态
setInterval(() => {
    chrome.storage.sync.get(['autoRefresh'], (result) => {
        console.log('自动刷新状态:', result.autoRefresh);
    });
}, 30000); // 30秒检查一次
