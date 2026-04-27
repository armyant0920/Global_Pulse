# JSON Schema — 報告輸出格式規範

每期報告以 JSON 格式儲存，由網站讀取呈現。本檔定義完整 schema。

---

## 檔案位置與命名

- 每期報告：`website/data/reports/YYYY-MM-DD-HHMM.json`
  - 範例：`2026-04-25-1430.json`
  - 含時間戳是因為使用者一天可能跑多次
- 索引檔（每期都要更新）：`website/data/index.json`

---

## 報告 JSON 完整結構

```json
{
  "report_id": "2026-04-25-1430",
  "generated_at": "2026-04-25T14:30:00+08:00",
  "version": "1.0",

  "editorial": {
    "title": "本期報告的一句話標題（AI 自訂，例如『AI 監管浪潮席捲多國，太平洋島國發出氣候吶喊』）",
    "summary": "150-250 字的編輯導讀。寫成報告編輯給讀者的開場，不要客套話。",
    "regions_covered": ["中國", "日本", "印度", "德國", "奈及利亞", "斐濟"],
    "topics_covered": ["AI 監管", "氣候政策", "民生"],
    "highlights": [
      "本期重點 1（標題式，10-25 字）",
      "本期重點 2",
      "本期重點 3"
    ],
    "stats": {
      "total_items": 10,
      "news_items": 6,
      "comparison_items": 3,
      "wildcard_items": 1
    }
  },

  "items": [
    {
      "id": "item-001",
      "type": "news",
      "title_zh": "中文標題",
      "title_original": "Original title in source language",
      "one_liner": "30 字以內的一句話重點",
      "summary": "150-200 字的中文摘要。專有名詞可保留原文。不要逐字翻譯，要符合中文閱讀習慣。",
      "why_read": "1-2 句編輯觀察。給讀者一個閱讀切入點，不是裝飾性句子。",
      "topic_tags": ["AI 與科技"],
      "region": "中國",
      "importance": "major",
      "source": {
        "media_name": "新華社",
        "media_country": "中國",
        "source_tier": "B",
        "source_tier_note": "中國官方媒體",
        "url": "https://example.com/article",
        "original_language": "zh-CN",
        "fetched_at": "2026-04-25T14:25:00+08:00"
      }
    },

    {
      "id": "item-007",
      "type": "comparison",
      "title_zh": "AI 監管的三種路徑：歐盟、中國、美國的本週交鋒",
      "comparison_topic": "AI 監管",
      "regions": ["歐盟", "中國", "美國"],
      "narrative": "300-500 字的敘事補充。點出表格中最值得注意的對比與背後脈絡。",
      "comparison_table": {
        "dimensions": ["政府立場", "媒體焦點", "民間反應", "與台灣的差異"],
        "rows": [
          {
            "region": "歐盟",
            "values": [
              "強調風險防範，本週通過某具體條款",
              "媒體聚焦合規成本",
              "民間擔心競爭力下降",
              "立法路徑與台灣討論中的版本相近"
            ]
          },
          {
            "region": "中國",
            "values": ["...", "...", "...", "..."]
          },
          {
            "region": "美國",
            "values": ["...", "...", "...", "..."]
          }
        ]
      },
      "why_read": "三地對 AI 監管的根本邏輯不同，這個對比能看出各自社會對技術的態度。",
      "topic_tags": ["AI 與科技", "民主與威權治理"],
      "importance": "major",
      "sources": [
        {
          "media_name": "Reuters",
          "media_country": "英國",
          "source_tier": "A",
          "url": "https://...",
          "original_language": "en",
          "fetched_at": "2026-04-25T14:25:00+08:00",
          "supports_region": "歐盟"
        },
        {
          "media_name": "新華社",
          "media_country": "中國",
          "source_tier": "B",
          "source_tier_note": "中國官媒",
          "url": "https://...",
          "original_language": "zh-CN",
          "fetched_at": "2026-04-25T14:26:00+08:00",
          "supports_region": "中國"
        },
        {
          "media_name": "The New York Times",
          "media_country": "美國",
          "source_tier": "A",
          "url": "https://...",
          "original_language": "en",
          "fetched_at": "2026-04-25T14:27:00+08:00",
          "supports_region": "美國"
        }
      ]
    },

    {
      "id": "item-010",
      "type": "wildcard",
      "title_zh": "斐濟青年世代的氣候焦慮：來自太平洋的第一線",
      "title_original": "Original title",
      "one_liner": "30 字以內重點",
      "summary": "150-200 字摘要",
      "why_read": "太平洋島國是氣候變遷最前線，但他們的聲音很少被亞洲華語媒體報導。",
      "topic_tags": ["氣候與環境"],
      "region": "斐濟",
      "importance": "wildcard",
      "source": {
        "media_name": "Fiji Times",
        "media_country": "斐濟",
        "source_tier": "B",
        "url": "https://...",
        "original_language": "en",
        "fetched_at": "2026-04-25T14:28:00+08:00"
      }
    }
  ]
}
```

---

## 欄位說明

### 頂層
| 欄位 | 必要 | 說明 |
|---|---|---|
| `report_id` | ✓ | 與檔名同（不含 .json） |
| `generated_at` | ✓ | ISO 8601 含時區 |
| `version` | ✓ | schema 版本，目前固定 "1.0" |

### editorial
| 欄位 | 必要 | 說明 |
|---|---|---|
| `title` | ✓ | 本期一句話標題 |
| `summary` | ✓ | 150-250 字編輯導讀 |
| `regions_covered` | ✓ | 本期涵蓋地區陣列（去重後） |
| `topics_covered` | ✓ | 本期涵蓋議題陣列（去重後） |
| `highlights` | ✓ | 2-3 個本期重點，標題式短句 |
| `stats` | ✓ | 數量統計，給網站首頁顯示用 |

### items（陣列）
每則資訊一個物件。`type` 欄位決定其他欄位結構。

#### type: "news"（一般新聞）
- `title_zh`, `title_original`, `one_liner`, `summary`, `why_read` 都必填
- `topic_tags`：陣列，從固定議題清單選 1-2 個
- `region`：單一地區（字串）
- `importance`：`"major"` / `"normal"`
- `source`：單一來源物件

#### type: "comparison"（議題比較）
- 沒有 `title_original`、`one_liner`，因為這是 AI 整合多來源的產出
- 必填：`title_zh`, `comparison_topic`, `regions`（陣列）, `narrative`, `comparison_table`, `why_read`, `sources`（陣列，每個 source 加 `supports_region` 標明支撐哪個地區的資料）
- `comparison_table.dimensions`：3-4 個比較維度
- `comparison_table.rows`：每地區一個 row，`values` 陣列順序對應 `dimensions`
- `importance`：固定 `"major"`

#### type: "wildcard"（冷門隨機）
- 結構同 `news`，但 `importance` 固定為 `"wildcard"`
- 來源等級允許 B 或 C，A 級當然也可以

### source 物件
| 欄位 | 必要 | 說明 |
|---|---|---|
| `media_name` | ✓ | 媒體名稱原文 |
| `media_country` | ✓ | 媒體所在國（中文） |
| `source_tier` | ✓ | "A" / "B" / "C" |
| `source_tier_note` | 視情況 | 簡短描述媒體性質（例如「中國官媒」「韓國保守派」「Reddit 討論串」） |
| `url` | ✓ | 可點擊原始連結 |
| `original_language` | ✓ | ISO 語言碼（zh-CN, en, ja, ko, ar, fr, de, es 等） |
| `fetched_at` | ✓ | ISO 8601 時間戳 |
| `supports_region` | comparison only | 此來源支撐比較單元的哪個地區 |

---

## 索引檔 index.json 結構

每次新增報告後，要更新此檔。

```json
{
  "version": "1.0",
  "last_updated": "2026-04-25T14:30:00+08:00",
  "reports": [
    {
      "report_id": "2026-04-25-1430",
      "filename": "2026-04-25-1430.json",
      "generated_at": "2026-04-25T14:30:00+08:00",
      "title": "AI 監管浪潮席捲多國，太平洋島國發出氣候吶喊",
      "regions": ["中國", "日本", "印度", "德國", "奈及利亞", "斐濟"],
      "topics": ["AI 監管", "氣候政策", "民生"],
      "total_items": 10
    }
  ]
}
```

`reports` 陣列以 `generated_at` 倒序排列（最新的在最前面）。

---

## 寫入時的注意事項

1. **JSON 必須是合法格式**：寫完後在心裡 / 工具裡驗證一遍
2. **時間戳用 ISO 8601 + 時區**（台灣為 +08:00）
3. **URL 必須可訪問**：不要寫成 placeholder
4. **避免控制字元**：摘要中的換行用 `\n`，不要直接在 JSON 字串裡放真換行
5. **更新 index.json 是必須步驟**：忘了更新，網站首頁就看不到新報告
6. **舊報告 JSON 不要改動**：每期是獨立檔案，不要回頭修改之前的
