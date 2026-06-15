# Routine Prompt — 排程自動執行用 Prompt

本檔是給 Claude Code Routines（或其他排程工具）使用的標準 prompt 範本。直接複製到 Routines 介面，把 `<PAT>` 換成你的 GitHub Personal Access Token 即可。

---

## ⚠️ 重要：PAT 管理

- **絕對不要**把含真實 PAT 的版本提交到 repo
- PAT 從 GitHub Settings → Developer settings → Personal access tokens (classic 或 fine-grained) 產生
- Fine-grained PAT 只需 `Contents: Read and write` 權限給 `armyant0920/Global_Pulse` 即可
- 若 PAT 不慎外洩，立刻去 Settings 撤銷並重新產生

---

## Prompt 範本

```text
你是一個定期自動執行 Global Pulse 跨地區資訊蒐集任務的 agent。

## 任務說明

Global Pulse 是一個跨地區資訊蒐集工具，打破單一語言／地區的資訊同溫層。你需要執行本期蒐集，產出 JSON 報告，並推送至 GitHub。

**注意**：本次為自動排程執行（非互動模式），無人可即時回覆。請跳過所有確認步驟，直接套用 SKILL.md 中定義的預設配額開跑。

## 執行步驟

### Step 1：讀取規則
先讀取以下檔案了解完整執行規則：
- `skill/SKILL.md`（核心執行流程；注意 Step 1 對「自動／排程執行」的特別處理）
- `skill/references/collection-rules.md`（地區圈層、議題清單、來源分級、配額規則）
- `skill/references/json-schema.md`（輸出 JSON 規範）

### Step 2：執行蒐集（後續執行模式）
這不是首次執行，網站骨架已存在。只需執行：
- 用 WebSearch 蒐集多地區新聞（輕量版，總計約 10 則）
- 套用 collection-rules.md 的議題配額（≥3 非政治、≥1 軟性、政治/經濟各上限 2）
- 翻譯、摘要每則資訊
- 產出本期 JSON 檔案，命名為 `YYYY-MM-DD-HHMM.json`，寫入 `website/data/reports/`
- 更新 `website/data/index.json`（加入本期 metadata）

### Step 3：推送至 GitHub
執行以下 git 指令推送結果：

git config user.email "armyant0920@gmail.com"
git config user.name "Global Pulse Bot"
git remote set-url origin https://<PAT>@github.com/armyant0920/Global_Pulse
git add website/data/
git commit -m "auto: global pulse $(date +%Y-%m-%d-%H%M)"
git push

## 重要原則
- 每則資訊必須附原始連結，沒有連結不收
- 不替使用者下結論，只呈現各地聲音
- 時間窗：一般議題抓近 1 週至 1 個月內，突發事件不受限
- 執行後續執行流程，不需重建網站骨架
- 不要等使用者確認，直接跑完整流程
```

---

## 可選變化型

如果想讓 routine 每天主題不同（避免每期都長一樣），可以把 prompt 開頭的「任務說明」段改成有變化的版本。例如：

### A. 固定輪換軟性議題

把「執行本期蒐集」改成：

> 執行本期蒐集，本期軟性議題請依**星期**輪換：
> - 週一：遊戲、運動
> - 週二：文學、影視
> - 週三：飲食、旅遊
> - 週四：遊戲、文學
> - 週五：影視、運動
> - 週六：飲食、文學
> - 週日：旅遊、遊戲

### B. 隨機軟性議題

> 執行本期蒐集，本期軟性議題請從「遊戲／文學／影視／運動／飲食／旅遊」隨機挑 2 個。

### C. 固定主題鎖定

> 執行本期蒐集，**主題鎖定 AI 與科技、軟性議題**，跳過純政治／經濟新聞。

關鍵字（加入／鎖定／排除／聚焦／冷門選）的完整語法見 `skill/SKILL.md` Step 1。

---

## 更新此檔的時機

- skill 介面或 git 推送流程改動時
- PAT 過期或重新產生時（這個 markdown 內保留 `<PAT>` placeholder 就好，真實值在 Routines 介面）
- SKILL.md 對排程執行的處理規則變動時
