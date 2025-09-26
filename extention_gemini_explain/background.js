// background.js - Service Worker
chrome.runtime.onInstalled.addListener(() => {
  // 創建上下文菜單
  chrome.contextMenus.create({
    id: "gemini-explain",
    title: "Gemini Ex",
    contexts: ["selection"]
  });
});

// 處理上下文菜單點擊
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "gemini-explain" && info.selectionText) {
    // 發送消息到 content script，若失敗則嘗試注入後重試
    trySendMessageWithFallback(tab.id, {
      action: "showSidebar",
      selectedText: info.selectionText
    });
  }
});

// 處理來自 content script 的 API 請求
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "callGeminiAPI") {
    callGeminiAPI(request.text)
      .then(response => {
        sendResponse({ success: true, data: response });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // 保持消息通道開放
  }
});

// Gemini API 調用函數
async function callGeminiAPI(text) {
  // 從存儲中獲取 API 密鑰
  const result = await chrome.storage.sync.get(['geminiApiKey']);
  // const apiKey = result.geminiApiKey;
  const apiKey = 'AIzaSyBzRFKYz309TFv6ZmpvCT7LfDY4xVhuLsE';
  
  if (!apiKey) {
    throw new Error('請先在擴展設置中配置 Gemini API 密鑰');
  }

  // 與提供的 shell 範例對齊：MODEL_ID 與 API entry
  const model = 'gemini-2.5-flash';
  const generateApiEntry = 'generateContent'; // 或改為 'streamGenerateContent'（如需串流）
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${generateApiEntry}?key=${apiKey}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: `請解釋以下文字內容：\n\n${text}` }
          ]
        }
      ],
      generationConfig: {
        thinkingConfig: {
          thinkingBudget: -1
        }
      }
    })
  });

  if (!response.ok) {
    let errorText = `API 請求失敗: ${response.status}`;
    try {
      const errBody = await response.json();
      if (errBody && errBody.error && errBody.error.message) {
        errorText += ` - ${errBody.error.message}`;
      }
    } catch (_) {
      // ignore
    }
    throw new Error(errorText);
  }

  const data = await response.json();
  // 防禦式解析，避免資料結構變動導致報錯
  const textPart = data?.candidates?.[0]?.content?.parts?.[0]?.text
    || data?.candidates?.[0]?.content?.parts?.[0]?.inlineData
    || data?.candidates?.[0]?.content?.parts?.[0]?.content
    || '';
  if (!textPart) {
    return JSON.stringify(data);
  }
  return textPart;
}

// 嘗試發送訊息，若沒有接收端則注入 content script 再重試
async function trySendMessageWithFallback(tabId, message) {
  try {
    const response = await chrome.tabs.sendMessage(tabId, message);
    return response;
  } catch (error) {
    // 若接收端不存在，注入 scripts 後重試
    await ensureContentScriptsInjected(tabId);
    return chrome.tabs.sendMessage(tabId, message);
  }
}

async function ensureContentScriptsInjected(tabId) {
  try {
    // 嘗試執行一段 no-op 代碼，若失敗則注入
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => true
    });
  } catch (_) {
    // 注入 content.js
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"]
    });
    // 注入 content.css
    try {
      await chrome.scripting.insertCSS({
        target: { tabId },
        files: ["content.css"]
      });
    } catch (_) {
      // 忽略 CSS 注入錯誤
    }
  }
}
