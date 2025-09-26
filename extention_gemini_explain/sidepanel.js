const responseDiv = document.getElementById('response');

// 監聽來自 background script 的訊息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'STREAM_START':
      responseDiv.innerHTML = '<p class="loading">Waiting for response...</p>';
      break;
    case 'STREAM_CONTENT':
      // 如果是第一次收到內容，就清空 "Loading" 訊息
      if (responseDiv.querySelector('.loading')) {
        responseDiv.innerHTML = '';
      }
      // 將新收到的內容附加到現有內容後面
      responseDiv.innerText += request.content;
      break;
    case 'STREAM_ERROR':
      responseDiv.innerHTML = `<p class="error">Error: ${request.error}</p>`;
      break;
    case 'STREAM_END':
      // 可以選擇在這裡做一些結束時的處理，例如移除 loading 動畫等
      console.log('Streaming finished.');
      break;
  }
});
