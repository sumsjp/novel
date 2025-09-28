// 監聽來自 content script 的訊息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'processText') {
      // 1. 打開側邊欄
      chrome.sidePanel.open({ windowId: sender.tab.windowId });
      
       // 2. 取得 API 金鑰並呼叫 Gemini
       chrome.storage.sync.get(['geminiApiKey'], (result) => {
         // const apiKey = result.geminiApiKey;
         const apiKey = 'AIzaSyBzRFKYz';
         const apiKey2 = apiKey + 'v6ZmpvCT7LfDY4xVhuLsE';
         if (!apiKey) {
           // 如果沒有金鑰，傳送錯誤訊息到側邊欄
           setTimeout(() => {
             sendToSidePanel({ type: 'STREAM_ERROR', error: 'API Key not found. Please set it in the extension options.' });
           }, 500);
           return;
         }
         // 延遲一點時間確保 sidepanel 載入完成
         setTimeout(() => {
           callGeminiApi(request.text, apiKey);
         }, 500);
       });
    }
    return true; // 表示將會非同步回覆
  });
  
  // 發送訊息到 sidepanel 的函數
  function sendToSidePanel(message) {
    // 嘗試發送到 sidepanel
    chrome.runtime.sendMessage(message)
      .then(response => {
        if (response && response.received) {
          console.log('Message sent to sidepanel successfully');
        }
      })
      .catch(error => {
        console.log('Sidepanel not ready, retrying...', error);
        // 如果 sidepanel 還沒載入，延遲重試
        setTimeout(() => {
          chrome.runtime.sendMessage(message)
            .then(response => {
              if (response && response.received) {
                console.log('Message sent to sidepanel on retry');
              }
            })
            .catch(() => {
              console.log('Sidepanel still not ready, message lost:', message.type);
            });
        }, 200);
      });
  }
  
  async function callGeminiApi(text, apiKey) {
    // 先測試簡單的 API 調用
    console.log('Testing API call with key:', apiKey.substring(0, 10) + '...');
    
    // 先嘗試非串流 API 確保基本功能
    const models = [
      { id: "gemini-2.5-flash", api: "generateContent", stream: false },
      { id: "gemini-2.5-flash", api: "streamGenerateContent", stream: true }
    ];
    
    // 告知側邊欄，API 呼叫已開始
    sendToSidePanel({ type: 'STREAM_START' });
    
    for (const model of models) {
      try {
        console.log(`Trying model: ${model.id} with API: ${model.api}`);
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model.id}:${model.api}?key=${apiKey}`;
        
        console.log('API URL:', API_URL);
        
        const requestBody = {
          contents: [{
            role: 'user',
            parts: [{
              text: `請解釋以下文字內容：\n\n${text}`
            }]
          }],
          generationConfig: {
            thinkingConfig: {
              thinkingBudget: -1
            }
          }
        };
        
        console.log('Request body:', JSON.stringify(requestBody, null, 2));
        
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });
  
        if (!response.ok) {
          console.log(`Model ${model.id} with API ${model.api} failed with status: ${response.status}`);
          continue; // 嘗試下一個模型
        }
  
        if (model.stream) {
          // 處理串流回應
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          let hasContent = false;
          
          console.log(`Success with model: ${model.id}, starting stream...`);
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            console.log('Received chunk:', buffer);
            
            // 嘗試解析完整的 JSON 對象
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // 保留最後一個不完整的行
            
            for (const line of lines) {
              if (line.trim() === '') continue;
              
              console.log('Processing line:', line);
              
              // 嘗試直接解析 JSON（根據你的 shell 腳本輸出）
              try {
                const data = JSON.parse(line);
                console.log('Parsed JSON:', data);
                
                const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (content) {
                  console.log('Found content:', content);
                  hasContent = true;
                  sendToSidePanel({ type: 'STREAM_CONTENT', content: content });
                }
              } catch (e) {
                console.log('Failed to parse line as JSON:', e.message);
                // 嘗試 SSE 格式
                if (line.startsWith('data: ')) {
                  const jsonStr = line.substring(6);
                  if (jsonStr === '[DONE]') continue;
                  
                  try {
                    const data = JSON.parse(jsonStr);
                    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (content) {
                      console.log('Found SSE content:', content);
                      hasContent = true;
                      sendToSidePanel({ type: 'STREAM_CONTENT', content: content });
                    }
                  } catch (e2) {
                    console.log('Failed to parse SSE JSON:', e2.message);
                  }
                }
              }
            }
          }
          
          if (hasContent) {
            // 發送完成信號
            sendToSidePanel({ type: 'STREAM_END' });
            return; // 成功，退出函數
          } else {
            console.log(`Model ${model.id} with stream API returned no content`);
            continue; // 嘗試下一個模型
          }
        } else {
          // 處理非串流回應
          const data = await response.json();
          console.log('Response data:', JSON.stringify(data, null, 2));
          
          const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (content) {
            console.log(`Success with model: ${model.id} (non-stream)`);
            // 模擬串流效果，逐字發送
            const words = content.split('');
            for (let i = 0; i < words.length; i++) {
              setTimeout(() => {
                sendToSidePanel({ type: 'STREAM_CONTENT', content: words[i] });
              }, i * 20); // 每 20ms 發送一個字符
            }
            
            // 最後發送完成信號
            setTimeout(() => {
              sendToSidePanel({ type: 'STREAM_END' });
            }, words.length * 20 + 100);
            
            return; // 成功，退出函數
          } else {
            console.log(`Model ${model.id} with non-stream API returned no content`);
            continue; // 嘗試下一個模型
          }
        }
      } catch (error) {
        console.log(`Model ${model.id} with API ${model.api} failed:`, error.message);
        continue; // 嘗試下一個模型
      }
    }
    
    // 如果所有模型都失敗了
    sendToSidePanel({ type: 'STREAM_ERROR', error: 'All models failed. Please check your API key and try again.' });
  }