# Gemini Explain Chrome 擴展

這是一個 Chrome 瀏覽器擴展，允許用戶選擇網頁上的文字，然後使用 Google Gemini AI 來解釋選中的內容。擴展使用 Chrome 的 Side Panel API 來顯示 AI 回應。

## 功能特點

- 🎯 **簡單易用**：選擇文字後會出現 "Gemini Ex" 按鈕
- 🤖 **AI 解釋**：使用 Google Gemini AI 提供智能解釋
- 📱 **側邊欄顯示**：在 Chrome 側邊欄中顯示 AI 回應
- 🔒 **安全存儲**：API 密鑰安全存儲在瀏覽器中
- ⚡ **串流回應**：即時顯示 AI 回應，無需等待完整結果
- 📱 **響應式設計**：支持桌面和移動設備

## 安裝步驟

### 1. 準備工作
- 確保您有 Google 帳戶
- 獲取 Gemini API 密鑰（見下方說明）

### 2. 獲取 Gemini API 密鑰
1. 訪問 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 使用您的 Google 帳戶登入
3. 點擊 "Create API Key" 創建新的 API 密鑰
4. 複製生成的 API 密鑰

### 3. 安裝擴展
1. 下載或克隆此項目到本地
2. 打開 Chrome 瀏覽器
3. 在地址欄輸入 `chrome://extensions/`
4. 開啟右上角的「開發者模式」
5. 點擊「載入未封裝項目」
6. 選擇項目文件夾
7. 擴展將被安裝並出現在擴展列表中

### 4. 配置 API 密鑰
1. 點擊擴展圖標
2. 在彈出窗口中輸入您的 Gemini API 密鑰
3. 點擊「保存密鑰」

## 使用方法

1. **選擇文字**：在任意網頁上選擇您想要解釋的文字
2. **點擊按鈕**：選擇文字後會出現藍色的 "Gemini Ex" 按鈕
3. **查看結果**：點擊按鈕後，Chrome 側邊欄會自動打開並顯示 AI 解釋
4. **即時顯示**：AI 回應會以串流方式即時顯示，無需等待完整結果

## 文件結構

```
extention_gemini_explain/
├── manifest.json          # 擴展配置文件
├── background.js          # 後台服務腳本
├── content.js            # 內容腳本
├── style.css             # 按鈕樣式
├── sidepanel.html        # 側邊欄界面
├── sidepanel.js          # 側邊欄腳本
├── options.html          # 設置界面
├── options.js            # 設置腳本
├── icons/                # 圖標文件夾
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # 說明文件
```

## 技術細節

### 權限說明
- `activeTab`：訪問當前活動標籤頁
- `contextMenus`：創建右鍵菜單
- `storage`：存儲 API 密鑰
- `host_permissions`：訪問 Gemini API

### API 使用
- 使用 Google Gemini Pro 模型
- 端點：`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- 請求格式：JSON

## 故障排除

### 常見問題

**Q: 選擇文字後沒有出現 "Gemini Ex" 按鈕**
A: 確保您已經選擇了文字，並且擴展已正確安裝。按鈕會出現在選中文字的右下角

**Q: API 調用失敗**
A: 檢查您的 API 密鑰是否正確，以及網絡連接是否正常

**Q: 側邊欄沒有顯示**
A: 檢查瀏覽器控制台是否有錯誤信息，確保 Chrome 版本支持 Side Panel API

**Q: API 密鑰保存失敗**
A: 確保您有足夠的存儲權限

### 調試方法
1. 打開 Chrome 開發者工具（F12）
2. 查看 Console 標籤頁的錯誤信息
3. 檢查 Network 標籤頁的 API 請求
4. 在 `chrome://extensions/` 中查看擴展錯誤

## 隱私和安全

- API 密鑰僅存儲在您的本地瀏覽器中
- 不會收集或傳輸任何個人數據
- 選中的文字僅發送給 Google Gemini API 進行處理

## 更新日誌

### v1.0
- 初始版本發布
- 基本的文字選擇和 AI 解釋功能
- 側邊欄 UI 界面
- API 密鑰管理

## 貢獻

歡迎提交 Issue 和 Pull Request 來改進此擴展。

## 許可證

MIT License
