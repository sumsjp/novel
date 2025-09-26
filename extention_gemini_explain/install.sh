#!/bin/bash

# Gemini Explain Chrome 擴展安裝腳本

echo "🚀 Gemini Explain Chrome 擴展安裝腳本"
echo "=================================="

# 檢查是否在正確的目錄
if [ ! -f "manifest.json" ]; then
    echo "❌ 錯誤：請在擴展根目錄中運行此腳本"
    exit 1
fi

echo "📁 檢查文件結構..."

# 檢查必要文件
required_files=("manifest.json" "background.js" "content.js" "content.css" "popup.html" "popup.js")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ 缺少文件: $file"
        exit 1
    fi
done

echo "✅ 所有必要文件都存在"

# 創建圖標文件夾
if [ ! -d "icons" ]; then
    echo "📁 創建圖標文件夾..."
    mkdir -p icons
fi

# 檢查圖標文件
if [ ! -f "icons/icon16.png" ] || [ ! -f "icons/icon48.png" ] || [ ! -f "icons/icon128.png" ]; then
    echo "⚠️  警告：缺少圖標文件"
    echo "   請將以下尺寸的 PNG 圖標放入 icons/ 文件夾："
    echo "   - icon16.png (16x16)"
    echo "   - icon48.png (48x48)" 
    echo "   - icon128.png (128x128)"
    echo ""
    echo "   或者使用提供的 icon.svg 文件轉換為 PNG"
fi

echo ""
echo "📋 安裝步驟："
echo "1. 打開 Chrome 瀏覽器"
echo "2. 在地址欄輸入: chrome://extensions/"
echo "3. 開啟右上角的「開發者模式」"
echo "4. 點擊「載入未封裝項目」"
echo "5. 選擇當前目錄: $(pwd)"
echo "6. 擴展將被安裝並出現在擴展列表中"
echo ""
echo "🔑 配置 API 密鑰："
echo "1. 訪問 https://makersuite.google.com/app/apikey"
echo "2. 創建 Gemini API 密鑰"
echo "3. 點擊擴展圖標，輸入 API 密鑰"
echo ""
echo "✅ 安裝腳本完成！"
echo ""
echo "💡 使用提示："
echo "- 選擇網頁上的文字"
echo "- 右鍵點擊選擇的文字"
echo "- 選擇 'Gemini Ex' 選項"
echo "- 查看右側邊欄中的 AI 解釋"
