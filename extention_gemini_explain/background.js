// 監聽來自 content script 的訊息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'processText') {
      // 1. 打開側邊欄
      chrome.sidePanel.open({ windowId: sender.tab.windowId });
      
      // 2. 取得 API 金鑰並呼叫 Gemini
      chrome.storage.sync.get(['geminiApiKey'], (result) => {
        //const apiKey = result.geminiApiKey;
        const apiKey = 'AIzaSyBzRFKYz309TFv6ZmpvCT7LfDY4xVhuLsE';
        if (!apiKey) {
          // 如果沒有金鑰，傳送錯誤訊息到側邊欄
          chrome.runtime.sendMessage({ type: 'STREAM_ERROR', error: 'API Key not found. Please set it in the extension options.' });
          return;
        }
        callGeminiApi(request.text, apiKey);
      });
    }
    return true; // 表示將會非同步回覆
  });
  
  async function callGeminiApi(text, apiKey) {
    // Gemini 1.5 Flash - 速度快且適合摘要和對話
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:streamGenerateContent?key=${apiKey}`;
  
    // 告知側邊欄，API 呼叫已開始
    chrome.runtime.sendMessage({ type: 'STREAM_START' });
  
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `請根據以下文字提供簡潔的回應或摘要：\n\n"${text}"`
            }]
          }]
        })
      });
  
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error.message || `HTTP error! status: ${response.status}`);
      }
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        
        const chunk = decoder.decode(value);
        // Gemini 的流式回應可能在一個 chunk 中包含多個 JSON 物件
        // 它們通常以 "data: " 開頭，我們需要解析它們
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.substring(5);
              const data = JSON.parse(jsonStr);
              const content = data.candidates[0].content.parts[0].text;
              // 將解析出的文字片段傳送到側邊欄
              chrome.runtime.sendMessage({ type: 'STREAM_CONTENT', content: content });
            } catch (e) {
              // 忽略無法解析的行
            }
          }
        }
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      chrome.runtime.sendMessage({ type: 'STREAM_ERROR', error: error.message });
    } finally {
      // 告知側邊欄，串流已結束
      chrome.runtime.sendMessage({ type: 'STREAM_END' });
    }
  }