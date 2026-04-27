# Website Setup — 網站初始化指引

首次執行 Global Pulse 之前，要先把網站骨架建立起來。後續每期執行只是新增 JSON，不需要再動網站檔案。

---

## 詢問使用者放置位置

第一次執行 skill 時，問使用者：

> 這是第一次執行，需要先建立本地網站骨架。預設會建在 `~/global-pulse/`，要用這個位置嗎？或者你想放到其他資料夾？

確認位置後執行下列步驟。以下範例假設使用者選擇 `~/global-pulse/`，請替換為實際路徑。

---

## 目錄結構

執行後應產生：

```
~/global-pulse/
├── index.html              ← 首頁（報告列表）
├── report.html             ← 單期報告檢視頁（讀取 query string ?id=xxx）
├── assets/
│   ├── style.css
│   └── app.js
└── data/
    ├── index.json          ← 所有報告的索引
    └── reports/
        └── (空，之後每期 JSON 放這裡)
```

---

## 建立步驟

1. 用 Bash `mkdir -p` 建立目錄結構
2. 把 `assets/website-template/` 底下的所有檔案複製到使用者的目錄下對應位置
3. 在 `data/index.json` 寫入初始空索引：

```json
{
  "version": "1.0",
  "last_updated": null,
  "reports": []
}
```

4. 確認檔案都在位後，告訴使用者：
   - 網站位置
   - 雙擊 `index.html` 即可開啟（注意：因為要讀取本地 JSON，某些瀏覽器可能因 CORS 限制檔案協定下的 fetch。如果遇到問題，建議在該目錄執行 `python3 -m http.server` 然後訪問 `http://localhost:8000`）

---

## CORS 解法（給使用者的備案說明）

雙擊 `index.html` 用 `file://` 協定開啟時，部分瀏覽器（特別是 Chrome）會拒絕 fetch 本地 JSON。給使用者三個選項：

**選項 1：用 Python 內建伺服器（最簡單）**
```bash
cd ~/global-pulse
python3 -m http.server 8000
```
然後訪問 `http://localhost:8000`

**選項 2：用 Firefox**
Firefox 對 file:// fetch 較寬鬆，可以直接雙擊開啟。

**選項 3：用 VS Code Live Server 擴充功能**
如果使用者用 VS Code，安裝 Live Server 擴充功能後右鍵 `index.html` → Open with Live Server。

我們的網站模板會內建偵測：如果 fetch 失敗會顯示友善提示，告訴使用者該怎麼辦。

---

## 後續每期執行的網站相關動作

之後每期執行時，網站本身不需要重建。只要：

1. 把新的 JSON 檔寫入 `data/reports/YYYY-MM-DD-HHMM.json`
2. 讀取現有 `data/index.json`，把新報告 metadata 加到 `reports` 陣列最前面
3. 更新 `last_updated` 時間
4. 寫回 `index.json`

完成。網站下次重新整理就會自動顯示新報告。
