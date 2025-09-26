let geminiButton = null;

// 移除按鈕的函式
function removeButton() {
  if (geminiButton) {
    geminiButton.remove();
    geminiButton = null;
  }
}

document.addEventListener('mouseup', (event) => {
  // 延遲一小段時間以確保選取完成
  setTimeout(() => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    removeButton(); // 先移除舊按鈕

    if (selectedText.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      geminiButton = document.createElement('button');
      geminiButton.id = 'gemini-ex-button';
      geminiButton.innerText = 'Gemini Ex';

      // 定位按鈕在選取文字的右下角
      geminiButton.style.left = `${window.scrollX + rect.right}px`;
      geminiButton.style.top = `${window.scrollY + rect.bottom}px`;
      
      document.body.appendChild(geminiButton);

      geminiButton.addEventListener('click', () => {
        console.log('Selected Text:', selectedText);
        // 傳送訊息到 background script
        chrome.runtime.sendMessage({
          action: 'processText',
          text: selectedText
        });
        removeButton();
      });
    }
  }, 10);
});

// 如果使用者點擊頁面其他地方，就移除按鈕
document.addEventListener('mousedown', (event) => {
  if (geminiButton && event.target !== geminiButton) {
    removeButton();
  }
});

