# Global Pulse

跨地區資訊蒐集與比較工具。打破單一語言／地區的資訊同溫層。

---

## 這個套件包含什麼

```
global-pulse/
├── skill/                    ← 給 AI 遵循的 skill 文件包
│   ├── SKILL.md              ← 核心指令（AI 觸發時讀這份）
│   ├── references/           ← 詳細規則
│   │   ├── collection-rules.md    ← 地區圈層、議題清單、來源分級
│   │   ├── json-schema.md         ← 輸出 JSON 規範
│   │   └── website-setup.md       ← 網站初始化指引
│   └── assets/
│       └── website-template/      ← 網站初始檔案
│
└── README.md                 ← 你正在讀這份
```

---

## 怎麼使用

### 第一次使用

1. 把 `skill/` 整個資料夾交給 AI（上傳 / 放進 Project / 放進 skill 載入路徑）
2. 對 AI 說「跑一次 global pulse」
3. AI 會問你網站要建在哪個目錄（預設 `~/global-pulse/`）
4. AI 會把網站骨架建立起來，並執行第一次蒐集
5. 雙擊 `index.html`（或啟動本地伺服器）開啟網站

### 第二次以後

直接對 AI 說「跑一次 global pulse」即可。AI 會：
- 讀取 SKILL.md 與 references
- 用 web_search 蒐集本期內容
- 產出 JSON 寫入 `data/reports/`
- 更新 `data/index.json`

網站重新整理就能看到新報告。

---

## 開啟網站的方法

因為網站需要讀取本地 JSON 檔案，部分瀏覽器（特別是 Chrome）不允許 `file://` 協定下的 fetch。三個解法擇一：

**A. Python 內建伺服器（最簡單）**
```bash
cd ~/global-pulse
python3 -m http.server 8000
```
然後訪問 http://localhost:8000

**B. 用 Firefox**
雙擊 `index.html` 即可，Firefox 對本地檔案較寬鬆。

**C. VS Code Live Server**
安裝 Live Server 擴充功能，右鍵 `index.html` → Open with Live Server。

---

## 內容比例（輕量版預設）

| 類型 | 數量 |
|---|---|
| 重大新聞 | 6 則 |
| 議題比較 | 1 篇（含約 3 則內容單元） |
| 隨機冷門地區 | 1 則 |
| **總計** | **10 則** |

可以在執行時跟 AI 說想要不同數量。

---

## 自訂與擴充

- **修改地區圈層**：編輯 `skill/references/collection-rules.md`
- **修改議題清單**：編輯 `skill/references/collection-rules.md`
- **修改網站樣式**：編輯 `assets/style.css`
- **修改 JSON 結構**：編輯 `skill/references/json-schema.md` 並同步更新 `assets/app.js` 的渲染邏輯

JSON 資料完全結構化，未來想轉移到其他平台（部落格、Notion、自架 CMS）只要寫一個轉換腳本即可。

---

## 排程執行（進階）

試跑階段建議手動執行 5-10 次，調整地區比例與議題篩選滿意後，再考慮搬到 Claude Cowork 做定期排程。

---

## 設計原則

1. 每則資訊一定附原始連結，使用者可驗證
2. 不替使用者下結論，只呈現「該地的聲音」
3. 跨地區比較呈現差異，不強行調和
4. 冷門地區寧缺勿濫，不用其他國家媒體「代替」當地評論
5. 重複議題只追蹤新進展，不重複報導
