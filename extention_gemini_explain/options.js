const apiKeyInput = document.getElementById('apiKey');
const saveButton = document.getElementById('save');
const statusDiv = document.getElementById('status');

// 儲存設定
function saveOptions() {
  const apiKey = apiKeyInput.value.trim();
  if (apiKey) {
    chrome.storage.sync.set({ geminiApiKey: apiKey }, () => {
      statusDiv.textContent = 'API Key saved!';
      setTimeout(() => {
        statusDiv.textContent = '';
      }, 1500);
    });
  }
}

// 載入已儲存的設定
function restoreOptions() {
  chrome.storage.sync.get(['geminiApiKey'], (result) => {
    if (result.geminiApiKey) {
      apiKeyInput.value = result.geminiApiKey;
    }
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
saveButton.addEventListener('click', saveOptions);