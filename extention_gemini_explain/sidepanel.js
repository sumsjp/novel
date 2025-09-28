const responseDiv = document.getElementById('response');
let fullContent = '';

// 確保 DOM 已載入
document.addEventListener('DOMContentLoaded', () => {
  console.log('Sidepanel loaded and ready');
  
  // 等待 Marked.js 載入
  setTimeout(() => {
    // 配置 Marked.js
    if (typeof marked !== 'undefined') {
      marked.setOptions({
        breaks: true,        // 支援 GitHub 風格的換行
        gfm: true,          // 支援 GitHub Flavored Markdown
        sanitize: false,    // 允許 HTML（因為我們信任 Gemini 的輸出）
        smartLists: true,   // 智能列表
        smartypants: true   // 智能標點符號
      });
      console.log('Marked.js loaded and configured successfully');
    } else {
      console.warn('Marked.js not loaded, falling back to simple parser');
    }
  }, 100);
});

// 使用 Marked.js 或回退到簡單解析器
function markdownToHtml(markdown) {
  if (typeof marked !== 'undefined') {
    try {
      return marked.parse(markdown);
    } catch (error) {
      console.error('Marked.js parsing error:', error);
      return simpleMarkdownToHtml(markdown);
    }
  } else {
    return simpleMarkdownToHtml(markdown);
  }
}

// 簡單的 Markdown 解析器（回退方案）
function simpleMarkdownToHtml(markdown) {
  return markdown
    // 標題
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // 粗體
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // 斜體
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // 代碼
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // 列表
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
    // 段落
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|l])/gm, '<p>')
    .replace(/(?<!>)$/gm, '</p>')
    // 清理多餘的標籤
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<h[1-6]>)/g, '$1')
    .replace(/(<\/h[1-6]>)<\/p>/g, '$1')
    .replace(/<p>(<li>)/g, '<ul>$1')
    .replace(/(<\/li>)<\/p>/g, '$1</ul>')
    // 換行
    .replace(/\n/g, '<br>');
}

// 監聽來自 background script 的訊息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Sidepanel received message:', request);
  
  if (!responseDiv) {
    console.error('Response div not found');
    return;
  }
  
  switch (request.type) {
    case 'STREAM_START':
      fullContent = '';
      responseDiv.innerHTML = '<p class="loading">🤖 AI 正在思考中...</p>';
      break;
    case 'STREAM_CONTENT':
      // 如果是第一次收到內容，就清空 "Loading" 訊息
      if (responseDiv.querySelector('.loading')) {
        responseDiv.innerHTML = '<div class="markdown-content"></div>';
      }
      
      // 累積內容
      fullContent += request.content;
      
      // 渲染 Markdown
      const markdownDiv = responseDiv.querySelector('.markdown-content');
      if (markdownDiv) {
        markdownDiv.innerHTML = markdownToHtml(fullContent);
      }
      break;
    case 'STREAM_ERROR':
      responseDiv.innerHTML = `<div class="error">❌ 錯誤：${request.error}</div>`;
      break;
    case 'STREAM_END':
      // 最終渲染
      const finalMarkdownDiv = responseDiv.querySelector('.markdown-content');
      if (finalMarkdownDiv) {
        finalMarkdownDiv.innerHTML = markdownToHtml(fullContent);
      }
      console.log('Streaming finished.');
      break;
  }
  
  // 回應表示已收到訊息
  sendResponse({ received: true });
});
