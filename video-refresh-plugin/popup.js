// 从存储中加载设置
async function loadSettings() {
    const settings = await chrome.storage.sync.get({
        refreshInterval: 60,
        videoSelectors: 'video, .video, .video-container',
        autoRefresh: false
    });
    
    document.getElementById('refreshInterval').value = settings.refreshInterval;
    document.getElementById('videoSelectors').value = settings.videoSelectors;
    document.getElementById('autoRefreshToggle').checked = settings.autoRefresh;
    
    updateStatus(settings.autoRefresh);
}

// 保存设置
async function saveSettings() {
    const settings = {
        refreshInterval: parseInt(document.getElementById('refreshInterval').value),
        videoSelectors: document.getElementById('videoSelectors').value,
        autoRefresh: document.getElementById('autoRefreshToggle').checked
    };
    
    await chrome.storage.sync.set(settings);
    updateStatus(settings.autoRefresh);
    
    // 通知内容脚本更新设置
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
        chrome.tabs.sendMessage(tab.id, {
            type: 'UPDATE_SETTINGS',
            settings: settings
        });
    }
    
    // 显示保存成功提示
    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = '保存成功';
    saveBtn.style.backgroundColor = '#4CAF50';
    
    setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.style.backgroundColor = '';
    }, 2000);
}

// 重置设置
async function resetSettings() {
    await chrome.storage.sync.clear();
    loadSettings();
}

// 更新状态显示
function updateStatus(isActive) {
    const statusDiv = document.getElementById('status');
    if (isActive) {
        statusDiv.textContent = '已启用自动刷新';
        statusDiv.className = 'status active';
    } else {
        statusDiv.textContent = '未启用';
        statusDiv.className = 'status inactive';
    }
}

// 事件监听
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    
    document.getElementById('saveBtn').addEventListener('click', saveSettings);
    document.getElementById('resetBtn').addEventListener('click', resetSettings);
    
    document.getElementById('autoRefreshToggle').addEventListener('change', (e) => {
        updateStatus(e.target.checked);
    });
});
