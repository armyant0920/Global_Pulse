// Global Pulse — 網站邏輯
const GlobalPulse = (function () {
  'use strict';

  function escapeHTML(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDate(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    } catch (e) {
      return iso;
    }
  }

  async function fetchJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${path}`);
    return res.json();
  }

  // ---- Index page ----
  async function renderIndex() {
    const listEl = document.getElementById('reports-list');
    let index;
    try {
      index = await fetchJSON('data/index.json');
    } catch (err) {
      console.error(err);
      listEl.innerHTML = '';
      document.getElementById('error-cors').hidden = false;
      return;
    }

    const reports = index.reports || [];
    if (reports.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <strong>還沒有報告</strong>
          執行第一次 Global Pulse 後，報告會出現在這裡。
        </div>`;
      return;
    }

    // Build filter options
    const allRegions = new Set();
    const allTopics = new Set();
    reports.forEach(r => {
      (r.regions || []).forEach(x => allRegions.add(x));
      (r.topics || []).forEach(x => allTopics.add(x));
    });

    const regionSelect = document.getElementById('filter-region');
    const topicSelect = document.getElementById('filter-topic');
    [...allRegions].sort().forEach(r => {
      const opt = document.createElement('option');
      opt.value = r; opt.textContent = r;
      regionSelect.appendChild(opt);
    });
    [...allTopics].sort().forEach(t => {
      const opt = document.createElement('option');
      opt.value = t; opt.textContent = t;
      topicSelect.appendChild(opt);
    });

    document.getElementById('filters').hidden = false;

    const searchInput = document.getElementById('filter-search');
    const statsEl = document.getElementById('filter-stats');

    function applyFilters() {
      const region = regionSelect.value;
      const topic = topicSelect.value;
      const q = searchInput.value.trim().toLowerCase();
      const filtered = reports.filter(r => {
        if (region && !(r.regions || []).includes(region)) return false;
        if (topic && !(r.topics || []).includes(topic)) return false;
        if (q) {
          const hay = [r.title, ...(r.regions || []), ...(r.topics || [])].join(' ').toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });
      renderList(filtered);
      statsEl.textContent = `顯示 ${filtered.length} / ${reports.length} 期報告`;
    }

    regionSelect.addEventListener('change', applyFilters);
    topicSelect.addEventListener('change', applyFilters);
    searchInput.addEventListener('input', applyFilters);
    document.getElementById('filter-reset').addEventListener('click', () => {
      regionSelect.value = '';
      topicSelect.value = '';
      searchInput.value = '';
      applyFilters();
    });

    function renderList(items) {
      if (items.length === 0) {
        listEl.innerHTML = `<div class="empty-state"><strong>沒有符合條件的報告</strong>試著放寬篩選條件。</div>`;
        return;
      }
      listEl.innerHTML = items.map(r => `
        <a class="report-card" href="report.html?id=${encodeURIComponent(r.report_id)}">
          <div class="report-card-date">${escapeHTML(formatDate(r.generated_at))}</div>
          <h3 class="report-card-title">${escapeHTML(r.title || '無標題')}</h3>
          <div class="report-card-meta">
            ${(r.regions || []).slice(0, 6).map(x => `<span class="tag">${escapeHTML(x)}</span>`).join('')}
            ${(r.topics || []).map(x => `<span class="tag">${escapeHTML(x)}</span>`).join('')}
          </div>
        </a>
      `).join('');
    }

    statsEl.textContent = `共 ${reports.length} 期報告`;
    renderList(reports);
  }

  // ---- Report page ----
  async function renderReport() {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const errBlock = document.getElementById('error-block');
    const errMsg = document.getElementById('error-message');

    if (!id) {
      errBlock.hidden = false;
      errMsg.textContent = '網址缺少 report id 參數';
      document.getElementById('editorial').innerHTML = '';
      return;
    }

    let report;
    try {
      report = await fetchJSON(`data/reports/${id}.json`);
    } catch (err) {
      errBlock.hidden = false;
      errMsg.textContent = `找不到報告：${id}（${err.message}）`;
      document.getElementById('editorial').innerHTML = '';
      return;
    }

    const editorial = report.editorial || {};
    document.getElementById('report-title').textContent = editorial.title || '報告';
    document.getElementById('report-meta').textContent =
      `${formatDate(report.generated_at)} · 共 ${(editorial.stats && editorial.stats.total_items) || (report.items || []).length} 則`;

    // Render editorial
    const editorialEl = document.getElementById('editorial');
    editorialEl.innerHTML = `
      <p class="editorial-summary">${escapeHTML(editorial.summary || '')}</p>
      ${editorial.highlights && editorial.highlights.length ? `
        <ul class="editorial-highlights">
          ${editorial.highlights.map(h => `<li>${escapeHTML(h)}</li>`).join('')}
        </ul>` : ''}
      <div class="editorial-stats">
        涵蓋地區：${(editorial.regions_covered || []).map(escapeHTML).join('、') || '—'}<br>
        涵蓋議題：${(editorial.topics_covered || []).map(escapeHTML).join('、') || '—'}
      </div>
    `;

    // Render items + filter chips
    const items = report.items || [];
    const counts = {
      all: items.length,
      major: items.filter(i => i.importance === 'major').length,
      comparison: items.filter(i => i.type === 'comparison').length,
      wildcard: items.filter(i => i.type === 'wildcard' || i.importance === 'wildcard').length
    };
    Object.keys(counts).forEach(k => {
      const el = document.querySelector(`[data-count="${k}"]`);
      if (el) el.textContent = counts[k];
    });

    document.getElementById('report-filters').hidden = false;
    document.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('chip-active'));
        chip.classList.add('chip-active');
        const filter = chip.dataset.filter;
        renderItems(items, filter);
      });
    });

    renderItems(items, 'all');
  }

  function renderItems(items, filter) {
    let filtered = items;
    if (filter === 'major') filtered = items.filter(i => i.importance === 'major');
    else if (filter === 'comparison') filtered = items.filter(i => i.type === 'comparison');
    else if (filter === 'wildcard') filtered = items.filter(i => i.type === 'wildcard' || i.importance === 'wildcard');

    const container = document.getElementById('items');
    if (filtered.length === 0) {
      container.innerHTML = `<div class="empty-state"><strong>沒有符合的項目</strong></div>`;
      return;
    }
    container.innerHTML = filtered.map(renderItem).join('');

    // Attach toggle listeners
    container.querySelectorAll('.item-header').forEach(h => {
      h.addEventListener('click', () => h.parentElement.classList.toggle('expanded'));
    });
  }

  function renderItem(item) {
    if (item.type === 'comparison') return renderComparisonItem(item);
    return renderNewsItem(item);
  }

  function renderNewsItem(item) {
    const badges = [];
    if (item.importance === 'major') badges.push(`<span class="badge badge-major">重要</span>`);
    if (item.importance === 'wildcard' || item.type === 'wildcard') badges.push(`<span class="badge badge-wildcard">冷門</span>`);
    if (item.region) badges.push(`<span class="badge badge-region">${escapeHTML(item.region)}</span>`);
    (item.topic_tags || []).forEach(t => badges.push(`<span class="badge">${escapeHTML(t)}</span>`));

    const src = item.source || {};
    return `
      <article class="item" id="${escapeHTML(item.id || '')}">
        <div class="item-header">
          <div class="item-header-content">
            <div class="item-badges">${badges.join('')}</div>
            <h3 class="item-title">${escapeHTML(item.title_zh || '')}</h3>
            <p class="item-one-liner">${escapeHTML(item.one_liner || '')}</p>
          </div>
          <span class="item-toggle">▶</span>
        </div>
        <div class="item-body">
          ${item.title_original ? `<p class="item-original-title">原文標題：${escapeHTML(item.title_original)}</p>` : ''}
          <p class="item-summary">${escapeHTML(item.summary || '').replace(/\n/g, '<br>')}</p>
          ${item.why_read ? `<div class="item-why-read">${escapeHTML(item.why_read)}</div>` : ''}
          <div class="item-source">
            ${src.source_tier ? `<span class="tier-badge tier-${escapeHTML(src.source_tier)}">${escapeHTML(src.source_tier)} 級</span>` : ''}
            <span><strong>${escapeHTML(src.media_name || '')}</strong>${src.media_country ? `（${escapeHTML(src.media_country)}）` : ''}${src.source_tier_note ? ` · ${escapeHTML(src.source_tier_note)}` : ''}</span>
            ${src.original_language ? `<span>原文：${escapeHTML(src.original_language)}</span>` : ''}
            ${src.url ? `<a class="source-link" href="${escapeHTML(src.url)}" target="_blank" rel="noopener noreferrer">查看原文 ↗</a>` : ''}
          </div>
        </div>
      </article>
    `;
  }

  function renderComparisonItem(item) {
    const badges = [`<span class="badge badge-comparison">議題比較</span>`];
    (item.topic_tags || []).forEach(t => badges.push(`<span class="badge">${escapeHTML(t)}</span>`));
    (item.regions || []).forEach(r => badges.push(`<span class="badge badge-region">${escapeHTML(r)}</span>`));

    const table = item.comparison_table || {};
    const dimensions = table.dimensions || [];
    const rows = table.rows || [];

    return `
      <article class="item expanded" id="${escapeHTML(item.id || '')}">
        <div class="item-header">
          <div class="item-header-content">
            <div class="item-badges">${badges.join('')}</div>
            <h3 class="item-title">${escapeHTML(item.title_zh || '')}</h3>
            <p class="item-one-liner">議題：${escapeHTML(item.comparison_topic || '')}</p>
          </div>
          <span class="item-toggle">▶</span>
        </div>
        <div class="item-body">
          ${dimensions.length ? `
            <div class="comparison-table-wrap">
              <table class="comparison-table">
                <thead>
                  <tr>
                    <th>地區 \\ 維度</th>
                    ${dimensions.map(d => `<th>${escapeHTML(d)}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${rows.map(r => `
                    <tr>
                      <th>${escapeHTML(r.region || '')}</th>
                      ${(r.values || []).map(v => `<td>${escapeHTML(v).replace(/\n/g, '<br>')}</td>`).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}
          ${item.narrative ? `<div class="comparison-narrative">${escapeHTML(item.narrative).replace(/\n/g, '<br>')}</div>` : ''}
          ${item.why_read ? `<div class="item-why-read">${escapeHTML(item.why_read)}</div>` : ''}
          ${(item.sources && item.sources.length) ? `
            <div class="comparison-sources">
              <h4>來源（${item.sources.length}）</h4>
              <ul>
                ${item.sources.map(s => `
                  <li>
                    ${s.source_tier ? `<span class="tier-badge tier-${escapeHTML(s.source_tier)}">${escapeHTML(s.source_tier)}</span>` : ''}
                    ${s.supports_region ? `<span class="badge badge-region">${escapeHTML(s.supports_region)}</span>` : ''}
                    <strong>${escapeHTML(s.media_name || '')}</strong>${s.media_country ? `（${escapeHTML(s.media_country)}）` : ''}
                    ${s.url ? `<a class="source-link" href="${escapeHTML(s.url)}" target="_blank" rel="noopener noreferrer">查看 ↗</a>` : ''}
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </article>
    `;
  }

  return { renderIndex, renderReport };
})();
