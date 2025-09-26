// content.js - Content Script
let sidebar = null;

// 監聽來自 background script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showSidebar") {
    showSidebar(request.selectedText);
  }
});

// 創建並顯示側邊欄
function showSidebar(selectedText) {
  // 如果側邊欄已存在，先移除
  if (sidebar) {
    sidebar.remove();
  }

  // 創建側邊欄元素
  sidebar = document.createElement('div');
  sidebar.id = 'gemini-sidebar';
  sidebar.innerHTML = `
    <div class="sidebar-header">
      <h3>Gemini 解釋</h3>
      <button class="close-btn">&times;</button>
    </div>
    <div class="sidebar-content">
      <div class="selected-text">
        <strong>選中的文字：</strong>
        <p>${selectedText}</p>
      </div>
      <div class="loading" id="loading">
        <div class="spinner"></div>
        <p>正在獲取 Gemini 解釋...</p>
      </div>
      <div class="response" id="response" style="display: none;">
        <strong>Gemini 解釋：</strong>
        <div class="response-content"></div>
      </div>
      <div class="error" id="error" style="display: none;">
        <strong>錯誤：</strong>
        <div class="error-content"></div>
      </div>
    </div>
  `;

  // 添加到頁面
  document.body.appendChild(sidebar);

  // 添加關閉按鈕事件
  sidebar.querySelector('.close-btn').addEventListener('click', () => {
    sidebar.remove();
    sidebar = null;
  });

  // 調用 Gemini API
  callGeminiAPI(selectedText);
}

// 調用 Gemini API
async function callGeminiAPI(text) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: "callGeminiAPI",
      text: text
    });

    const loading = document.getElementById('loading');
    const responseDiv = document.getElementById('response');
    const errorDiv = document.getElementById('error');

    loading.style.display = 'none';

    if (response.success) {
      responseDiv.style.display = 'block';
      responseDiv.querySelector('.response-content').textContent = response.data;
    } else {
      errorDiv.style.display = 'block';
      errorDiv.querySelector('.error-content').textContent = response.error;
    }
  } catch (error) {
    const loading = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    
    loading.style.display = 'none';
    errorDiv.style.display = 'block';
    errorDiv.querySelector('.error-content').textContent = error.message;
  }
}
