// popup.js - 彈出窗口腳本
document.addEventListener('DOMContentLoaded', function() {
  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('saveBtn');
  const status = document.getElementById('status');

  // 載入已保存的 API 密鑰
  loadApiKey();

  // 保存按鈕點擊事件
  saveBtn.addEventListener('click', saveApiKey);

  // Enter 鍵保存
  apiKeyInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      saveApiKey();
    }
  });

  // 載入 API 密鑰
  async function loadApiKey() {
    try {
      const result = await chrome.storage.sync.get(['geminiApiKey']);
      if (result.geminiApiKey) {
        apiKeyInput.value = result.geminiApiKey;
      }
    } catch (error) {
      console.error('載入 API 密鑰失敗:', error);
    }
  }

  // 保存 API 密鑰
  async function saveApiKey() {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      showStatus('請輸入 API 密鑰', 'error');
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = '保存中...';

    try {
      await chrome.storage.sync.set({ geminiApiKey: apiKey });
      showStatus('API 密鑰保存成功！', 'success');
      
      // 清空輸入框
      apiKeyInput.value = '';
      
      // 延遲關閉彈出窗口
      setTimeout(() => {
        window.close();
      }, 1500);
      
    } catch (error) {
      console.error('保存 API 密鑰失敗:', error);
      showStatus('保存失敗，請重試', 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = '保存密鑰';
    }
  }

  // 顯示狀態消息
  function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';
    
    // 3秒後隱藏狀態消息
    setTimeout(() => {
      status.style.display = 'none';
    }, 3000);
  }
});
