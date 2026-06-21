// ============================================================
// APP.JS — Wealth Ledger Dashboard logic
// ============================================================

const fmtINR = (n, decimals=0) => {
  if (n === null || n === undefined || isNaN(n)) return '—';
  const sign = n < 0 ? '-' : '';
  n = Math.abs(n);
  return sign + '₹' + n.toLocaleString('en-IN', {maximumFractionDigits: decimals, minimumFractionDigits: decimals});
};
const fmtCr = (n) => { // n in crores already
  if (n >= 1000) return '₹' + (n/1000).toFixed(1) + 'K Cr';
  return '₹' + n.toLocaleString('en-IN') + ' Cr';
};
const fmtPct = (n, decimals=1) => {
  if (n === null || n === undefined || isNaN(n)) return '—';
  const sign = n > 0 ? '+' : '';
  return sign + n.toFixed(decimals) + '%';
};
const pctClass = (n) => n >= 0 ? 'up' : 'down';
const stars = (n) => '★'.repeat(n) + '☆'.repeat(5-n);

let CHARTS = {}; // registry of chart instances so we can destroy/recreate on update

const HOLDINGS_DEPENDENT_PAGES = {
  p4: () => { document.getElementById('p4').innerHTML = pageFundCategory('multiAsset','Multi Asset Allocation Funds','Funds that spread your money across equity, debt, and gold/commodities in one scheme, automatically rebalanced.'); initFundCategoryCharts('multiAsset'); },
  p5: () => { document.getElementById('p5').innerHTML = pageFundCategory('flexiCap','Flexi Cap Funds','Equity funds free to move across large, mid, and small companies as the fund manager sees opportunity.'); initFundCategoryCharts('flexiCap'); },
  p6: () => { document.getElementById('p6').innerHTML = pageFundCategory('smallCap','Small Cap Funds','High-growth, high-volatility funds investing in companies ranked 251st and beyond by market cap.'); initFundCategoryCharts('smallCap'); },
  p7: () => { document.getElementById('p7').innerHTML = pageFundCategory('index','Index Funds','Passive funds that simply replicate an index like the Nifty 50 — lowest cost, no fund-manager bias.'); initFundCategoryCharts('index'); },
  p8: () => { document.getElementById('p8').innerHTML = pageFundCategory('elss','ELSS — Tax Saving Funds','Equity funds with a 3-year lock-in that qualify for tax deduction up to ₹1.5 lakh under Section 80C.'); initFundCategoryCharts('elss'); },
  p9: () => { document.getElementById('p9').innerHTML = pageFundCategory('hybrid','Hybrid / Balanced Advantage Funds','One fund that dynamically shifts between equity and debt based on market valuations.'); initFundCategoryCharts('hybrid'); },
  p10: () => { document.getElementById('p10').innerHTML = pageRecommended(); initRecommendedPage(); },
  p11: () => { document.getElementById('p11').innerHTML = pageActionPlan(); },
  p1: () => { renderPortfolioPage(); },
};

function setPage(id){
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if(HOLDINGS_DEPENDENT_PAGES[id]) HOLDINGS_DEPENDENT_PAGES[id]();
  document.getElementById(id).classList.add('active');
  document.querySelector(`.nav-item[data-page="${id}"]`).classList.add('active');
  window.scrollTo(0,0);
}

document.addEventListener('DOMContentLoaded', () => {
  loadHoldingsFromLocalStorage();
  buildAllPages();
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => setPage(item.dataset.page));
  });
  initPortfolioPage();
  initProjectorPage();
  initCalculatorPage();
  initFundPages();
  initRecommendedPage();
});

function buildAllPages(){
  const main = document.getElementById('mainContent');
  main.innerHTML = `
    <section id="p1" class="page active">${pagePortfolio()}</section>
    <section id="p2" class="page">${pageProjector()}</section>
    <section id="p3" class="page">${pageCalculator()}</section>
    <section id="p4" class="page">${pageFundCategory('multiAsset','Multi Asset Allocation Funds','Funds that spread your money across equity, debt, and gold/commodities in one scheme, automatically rebalanced.')}</section>
    <section id="p5" class="page">${pageFundCategory('flexiCap','Flexi Cap Funds','Equity funds free to move across large, mid, and small companies as the fund manager sees opportunity.')}</section>
    <section id="p6" class="page">${pageFundCategory('smallCap','Small Cap Funds','High-growth, high-volatility funds investing in companies ranked 251st and beyond by market cap.')}</section>
    <section id="p7" class="page">${pageFundCategory('index','Index Funds','Passive funds that simply replicate an index like the Nifty 50 — lowest cost, no fund-manager bias.')}</section>
    <section id="p8" class="page">${pageFundCategory('elss','ELSS — Tax Saving Funds','Equity funds with a 3-year lock-in that qualify for tax deduction up to ₹1.5 lakh under Section 80C.')}</section>
    <section id="p9" class="page">${pageFundCategory('hybrid','Hybrid / Balanced Advantage Funds','One fund that dynamically shifts between equity and debt based on market valuations.')}</section>
    <section id="p10" class="page">${pageRecommended()}</section>
    <section id="p11" class="page">${pageActionPlan()}</section>
  `;
}

// ============================================================
// PAGE 1 — PORTFOLIO SNAPSHOT (fully editable, no hardcoded data)
// ============================================================
function pagePortfolio(){
  const h = HOLDINGS;
  const hasAny = h.mutualFunds.length > 0 || h.equity.length > 0;
  const totalPnl = h.totalCurrent - h.totalInvested;
  const totalPnlPct = h.totalInvested ? (totalPnl / h.totalInvested) * 100 : 0;
  const mfPnl = h.totalMFCurrent - h.totalMFInvested;
  const mfPnlPct = h.totalMFInvested ? (mfPnl / h.totalMFInvested) * 100 : 0;
  const eqPnl = h.totalEquityCurrent - h.totalEquityInvested;
  const eqPnlPct = h.totalEquityInvested ? (eqPnl / h.totalEquityInvested) * 100 : 0;

  return `
    <div class="page-eyebrow">Page 01 · Overview</div>
    <h1 class="page-title">Your Portfolio, Today</h1>
    <p class="page-sub">Add your own mutual funds and stocks/ETFs below — nothing here is pre-filled. Your data stays in this browser only, and you can export it to a file or re-import it any time.</p>

    <div class="card mb-24" style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;">
      <div style="font-size:12.5px;color:var(--slate);max-width:480px;">
        This is a public, shareable dashboard with no server — your holdings live only in this browser's local storage. Use <b>Export</b> to save a backup file, and <b>Import</b> to load it again later or on another device.
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-outline" id="btnExportJSON">Export JSON</button>
        <label class="btn btn-outline" style="cursor:pointer;">
          Import JSON
          <input type="file" id="fileImportJSON" accept="application/json" style="display:none;">
        </label>
        <button class="btn" style="background:var(--rust);" id="btnClearAll">Clear All Data</button>
      </div>
    </div>
    <div id="importStatus"></div>

    ${hasAny ? `
    <div class="grid grid-4 mb-32">
      <div class="stat-tile">
        <div class="stat-label">Total Invested</div>
        <div class="stat-value mono">${fmtINR(h.totalInvested)}</div>
        <div class="stat-foot">Across ${h.mutualFunds.length} mutual fund${h.mutualFunds.length===1?'':'s'} + ${h.equity.length} stock/ETF holding${h.equity.length===1?'':'s'}</div>
      </div>
      <div class="stat-tile">
        <div class="stat-label">Current Value</div>
        <div class="stat-value mono">${fmtINR(h.totalCurrent)}</div>
        <div class="stat-foot">As entered by you</div>
      </div>
      <div class="stat-tile">
        <div class="stat-label">Overall P&amp;L</div>
        <div class="stat-value mono" style="color:${totalPnl>=0?'var(--teal)':'var(--rust)'}">${fmtINR(totalPnl)}</div>
        <div class="stat-delta ${pctClass(totalPnlPct)}">${fmtPct(totalPnlPct)} overall</div>
      </div>
      <div class="stat-tile">
        <div class="stat-label">Monthly Capacity</div>
        <div class="stat-value mono">${fmtINR(USER.sipMin)}–${fmtINR(USER.sipMax)}</div>
        <div class="stat-foot">${((USER.sipMin/USER.salary)*100).toFixed(0)}–${((USER.sipMax/USER.salary)*100).toFixed(0)}% of ₹${USER.salary.toLocaleString('en-IN')} salary</div>
      </div>
    </div>` : `
    <div class="callout note mb-32">
      <span class="callout-title">No holdings added yet</span>
      Use the "Add a mutual fund" and "Add a stock/ETF" forms below to start building your portfolio view. Everything else in this dashboard — the projector, calculator, and recommendations — works fine even with zero holdings, but gets more personal once you add yours.
    </div>
    `}

    <div class="two-col mb-32">
      <div class="card">
        <div class="flex-between mb-16">
          <div class="section-title" style="margin-bottom:0;">Mutual Funds</div>
          <button class="btn" id="btnAddMF">+ Add fund</button>
        </div>
        <div id="mfFormSlot"></div>
        ${h.mutualFunds.length ? `
        <div class="table-wrap">
          <table>
            <thead><tr><th>Fund</th><th class="num">Invested</th><th class="num">Current</th><th class="num">Returns</th><th class="num">XIRR</th><th></th></tr></thead>
            <tbody>
              ${h.mutualFunds.map((f,i) => {
                const ret = f.current - f.invested;
                const retPct = f.invested ? (ret/f.invested)*100 : 0;
                return `
                <tr>
                  <td class="fund-name">${f.name}<span class="fund-sub">${f.plan||''}${f.months?' · '+f.months+' months held':''}</span></td>
                  <td class="num">${fmtINR(f.invested)}</td>
                  <td class="num">${fmtINR(f.current)}</td>
                  <td class="num" style="color:${ret>=0?'var(--teal)':'var(--rust)'}">${fmtINR(ret)} (${fmtPct(retPct)})</td>
                  <td class="num">${f.xirr!=null && f.xirr!=='' ? `<span class="pill pill-teal">${Number(f.xirr).toFixed(2)}%</span>` : '—'}</td>
                  <td class="num"><button class="btn-icon-edit" data-edit-mf="${i}" style="color:var(--slate);margin-right:6px;">Edit</button><button class="btn-icon-del" data-del-mf="${i}" style="color:var(--rust);">Delete</button></td>
                </tr>
              `;}).join('')}
              <tr class="row-highlight">
                <td class="fund-name">Total</td>
                <td class="num">${fmtINR(h.totalMFInvested)}</td>
                <td class="num">${fmtINR(h.totalMFCurrent)}</td>
                <td class="num" style="color:${mfPnl>=0?'var(--teal)':'var(--rust)'}">${fmtINR(mfPnl)} (${fmtPct(mfPnlPct)})</td>
                <td class="num">—</td><td></td>
              </tr>
            </tbody>
          </table>
        </div>` : `<div class="text-sm text-slate" style="text-align:center;padding:20px 0;">No mutual funds added yet.</div>`}
      </div>

      <div class="card">
        ${hasAny ? `
        <div class="chart-box h-260"><canvas id="chartAllocation"></canvas></div>
        <div class="legend-row" id="allocationLegend" style="justify-content:center;margin-top:10px;"></div>
        ` : `<div class="text-sm text-slate" style="text-align:center;padding:60px 20px;">Your allocation chart will appear here once you add a holding.</div>`}
      </div>
    </div>

    <div class="card mb-32">
      <div class="flex-between mb-16">
        <div class="section-title" style="margin-bottom:0;">Stocks &amp; ETFs</div>
        <button class="btn" id="btnAddEq">+ Add stock/ETF</button>
      </div>
      <div id="eqFormSlot"></div>
      ${h.equity.length ? `
      <div class="table-wrap">
        <table>
          <thead><tr><th>Holding</th><th class="num">Qty</th><th class="num">Avg. Price</th><th class="num">Invested</th><th class="num">Current</th><th class="num">P&amp;L</th><th></th></tr></thead>
          <tbody>
            ${h.equity.map((e,i) => {
              const pnl = e.current - e.invested;
              const pnlPct = e.invested ? (pnl/e.invested)*100 : 0;
              return `
              <tr>
                <td class="fund-name">${e.name}<span class="fund-sub">${e.symbol||''}</span></td>
                <td class="num">${e.qty}</td>
                <td class="num">₹${Number(e.avgPrice).toFixed(2)}</td>
                <td class="num">${fmtINR(e.invested)}</td>
                <td class="num">${fmtINR(e.current)}</td>
                <td class="num" style="color:${pnl>=0?'var(--teal)':'var(--rust)'}">${fmtINR(pnl)} (${fmtPct(pnlPct)})</td>
                <td class="num"><button class="btn-icon-edit" data-edit-eq="${i}" style="color:var(--slate);margin-right:6px;">Edit</button><button class="btn-icon-del" data-del-eq="${i}" style="color:var(--rust);">Delete</button></td>
              </tr>
            `;}).join('')}
            <tr class="row-highlight">
              <td class="fund-name">Total</td><td></td><td></td>
              <td class="num">${fmtINR(h.totalEquityInvested)}</td>
              <td class="num">${fmtINR(h.totalEquityCurrent)}</td>
              <td class="num" style="color:${eqPnl>=0?'var(--teal)':'var(--rust)'}">${fmtINR(eqPnl)} (${fmtPct(eqPnlPct)})</td><td></td>
            </tr>
          </tbody>
        </table>
      </div>` : `<div class="text-sm text-slate" style="text-align:center;padding:20px 0;">No stocks or ETFs added yet.</div>`}
    </div>

    <div class="disclaimer-box">
      All figures on this page are entered and edited by you. Nothing is fetched live from any broker or exchange — update values yourself whenever you want a fresh snapshot. This is not investment advice; it's a structured view of your own numbers to help you decide for yourself.
    </div>
  `;
}

function mfFormHTML(existing, idx){
  const f = existing || {};
  return `
    <div class="card" style="background:var(--paper-dim);margin-bottom:18px;">
      <div class="grid grid-3 mb-16">
        <div class="control-group" style="margin-bottom:0;">
          <label class="text-sm" style="font-weight:600;display:block;margin-bottom:6px;">Fund name</label>
          <input type="text" id="mfName" value="${f.name||''}" placeholder="e.g. Parag Parikh Flexi Cap Fund" style="width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:6px;font-size:13px;">
        </div>
        <div class="control-group" style="margin-bottom:0;">
          <label class="text-sm" style="font-weight:600;display:block;margin-bottom:6px;">Plan</label>
          <input type="text" id="mfPlan" value="${f.plan||'Direct Growth'}" placeholder="Direct Growth" style="width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:6px;font-size:13px;">
        </div>
        <div class="control-group" style="margin-bottom:0;">
          <label class="text-sm" style="font-weight:600;display:block;margin-bottom:6px;">Months held</label>
          <input type="number" id="mfMonths" value="${f.months||''}" placeholder="9" style="width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:6px;font-size:13px;">
        </div>
      </div>
      <div class="grid grid-3 mb-16">
        <div class="control-group" style="margin-bottom:0;">
          <label class="text-sm" style="font-weight:600;display:block;margin-bottom:6px;">Invested amount (₹)</label>
          <input type="number" id="mfInvested" value="${f.invested!=null?f.invested:''}" placeholder="8000" style="width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:6px;font-size:13px;">
        </div>
        <div class="control-group" style="margin-bottom:0;">
          <label class="text-sm" style="font-weight:600;display:block;margin-bottom:6px;">Current value (₹)</label>
          <input type="number" id="mfCurrent" value="${f.current!=null?f.current:''}" placeholder="8114" style="width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:6px;font-size:13px;">
        </div>
        <div class="control-group" style="margin-bottom:0;">
          <label class="text-sm" style="font-weight:600;display:block;margin-bottom:6px;">XIRR % (optional)</label>
          <input type="number" id="mfXirr" value="${f.xirr!=null?f.xirr:''}" placeholder="19.24" style="width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:6px;font-size:13px;">
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn" id="mfSaveBtn">${existing ? 'Save changes' : 'Add fund'}</button>
        <button class="btn btn-outline" id="mfCancelBtn">Cancel</button>
      </div>
    </div>
  `;
}

function eqFormHTML(existing, idx){
  const e = existing || {};
  return `
    <div class="card" style="background:var(--paper-dim);margin-bottom:18px;">
      <div class="grid grid-3 mb-16">
        <div class="control-group" style="margin-bottom:0;">
          <label class="text-sm" style="font-weight:600;display:block;margin-bottom:6px;">Name</label>
          <input type="text" id="eqName" value="${e.name||''}" placeholder="e.g. ITC Ltd." style="width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:6px;font-size:13px;">
        </div>
        <div class="control-group" style="margin-bottom:0;">
          <label class="text-sm" style="font-weight:600;display:block;margin-bottom:6px;">Symbol</label>
          <input type="text" id="eqSymbol" value="${e.symbol||''}" placeholder="ITC" style="width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:6px;font-size:13px;">
        </div>
        <div class="control-group" style="margin-bottom:0;">
          <label class="text-sm" style="font-weight:600;display:block;margin-bottom:6px;">Quantity</label>
          <input type="number" id="eqQty" value="${e.qty!=null?e.qty:''}" placeholder="1" style="width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:6px;font-size:13px;">
        </div>
      </div>
      <div class="grid grid-3 mb-16">
        <div class="control-group" style="margin-bottom:0;">
          <label class="text-sm" style="font-weight:600;display:block;margin-bottom:6px;">Avg. buy price (₹)</label>
          <input type="number" id="eqAvgPrice" value="${e.avgPrice!=null?e.avgPrice:''}" placeholder="309.30" style="width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:6px;font-size:13px;">
        </div>
        <div class="control-group" style="margin-bottom:0;">
          <label class="text-sm" style="font-weight:600;display:block;margin-bottom:6px;">Invested amount (₹)</label>
          <input type="number" id="eqInvested" value="${e.invested!=null?e.invested:''}" placeholder="309" style="width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:6px;font-size:13px;">
        </div>
        <div class="control-group" style="margin-bottom:0;">
          <label class="text-sm" style="font-weight:600;display:block;margin-bottom:6px;">Current value (₹)</label>
          <input type="number" id="eqCurrent" value="${e.current!=null?e.current:''}" placeholder="293" style="width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:6px;font-size:13px;">
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn" id="eqSaveBtn">${existing ? 'Save changes' : 'Add holding'}</button>
        <button class="btn btn-outline" id="eqCancelBtn">Cancel</button>
      </div>
    </div>
  `;
}

function initPortfolioPage(){
  wirePortfolioPageEvents();
  drawAllocationChart();
}

function renderPortfolioPage(){
  const existingPage = document.getElementById('p1');
  const wasActive = existingPage && existingPage.classList.contains('active');
  existingPage.outerHTML = `<section id="p1" class="page${wasActive?' active':''}">${pagePortfolio()}</section>`;
  wirePortfolioPageEvents();
  drawAllocationChart();
}

function drawAllocationChart(){
  const ctx = document.getElementById('chartAllocation');
  if(!ctx) return;
  const h = HOLDINGS;
  const data = [];
  h.mutualFunds.forEach((f,i) => data.push({ label: f.name, value: f.current, color: ['#1A6F5C','#C8932A','#3B5BA9','#7B5EA7','#2D8F8F'][i%5] }));
  if(h.totalEquityCurrent > 0) data.push({ label: 'Stocks & ETFs', value: h.totalEquityCurrent, color: '#5B6470' });
  if(data.length === 0) return;

  if(CHARTS.allocation) CHARTS.allocation.destroy();
  CHARTS.allocation = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d=>d.label),
      datasets: [{ data: data.map(d=>d.value), backgroundColor: data.map(d=>d.color), borderWidth:3, borderColor:'#fff' }]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      cutout:'62%',
      plugins:{ legend:{display:false}, tooltip:{callbacks:{label:(c)=>` ${c.label}: ${fmtINR(c.raw)}`}} }
    }
  });
  const legend = document.getElementById('allocationLegend');
  if(legend) legend.innerHTML = data.map(d => `<span class="legend-item"><span class="legend-dot" style="background:${d.color}"></span>${d.label} · ${fmtINR(d.value)}</span>`).join('');
}

function wirePortfolioPageEvents(){
  const page = document.getElementById('p1');
  if(!page) return;

  // Add / Edit mutual fund
  const mfFormSlot = page.querySelector('#mfFormSlot');
  page.querySelector('#btnAddMF')?.addEventListener('click', () => {
    mfFormSlot.innerHTML = mfFormHTML(null, null);
    wireMfForm(null);
  });
  page.querySelectorAll('[data-edit-mf]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.editMf);
      mfFormSlot.innerHTML = mfFormHTML(HOLDINGS.mutualFunds[idx], idx);
      wireMfForm(idx);
    });
  });
  page.querySelectorAll('[data-del-mf]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.delMf);
      HOLDINGS.mutualFunds.splice(idx,1);
      recomputeHoldingTotals();
      saveHoldingsToLocalStorage();
      renderPortfolioPage();
    });
  });

  // Add / Edit equity
  const eqFormSlot = page.querySelector('#eqFormSlot');
  page.querySelector('#btnAddEq')?.addEventListener('click', () => {
    eqFormSlot.innerHTML = eqFormHTML(null, null);
    wireEqForm(null);
  });
  page.querySelectorAll('[data-edit-eq]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.editEq);
      eqFormSlot.innerHTML = eqFormHTML(HOLDINGS.equity[idx], idx);
      wireEqForm(idx);
    });
  });
  page.querySelectorAll('[data-del-eq]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.delEq);
      HOLDINGS.equity.splice(idx,1);
      recomputeHoldingTotals();
      saveHoldingsToLocalStorage();
      renderPortfolioPage();
    });
  });

  // Export
  page.querySelector('#btnExportJSON')?.addEventListener('click', exportHoldingsAsJSON);

  // Import
  const fileInput = page.querySelector('#fileImportJSON');
  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(!file) return;
    importHoldingsFromJSON(file, (success, errMsg) => {
      const statusSlot = document.getElementById('importStatus');
      if(success){
        renderPortfolioPage();
        const s = document.getElementById('importStatus');
        if(s) s.innerHTML = `<div class="callout mb-24" style="margin-top:-8px;">Holdings imported successfully.</div>`;
      } else {
        if(statusSlot) statusSlot.innerHTML = `<div class="callout warn mb-24" style="margin-top:-8px;">Import failed: ${errMsg}</div>`;
      }
    });
  });

  // Clear all
  page.querySelector('#btnClearAll')?.addEventListener('click', () => {
    if(!confirm('This will permanently delete all holdings you\'ve entered in this browser. Continue?')) return;
    HOLDINGS.mutualFunds = [];
    HOLDINGS.equity = [];
    recomputeHoldingTotals();
    saveHoldingsToLocalStorage();
    renderPortfolioPage();
  });
}

function wireMfForm(idx){
  const page = document.getElementById('p1');
  page.querySelector('#mfCancelBtn').addEventListener('click', () => {
    page.querySelector('#mfFormSlot').innerHTML = '';
  });
  page.querySelector('#mfSaveBtn').addEventListener('click', () => {
    const name = page.querySelector('#mfName').value.trim();
    const invested = parseFloat(page.querySelector('#mfInvested').value);
    const current = parseFloat(page.querySelector('#mfCurrent').value);
    if(!name || isNaN(invested) || isNaN(current)){
      alert('Please fill in at least the fund name, invested amount, and current value.');
      return;
    }
    const record = {
      name,
      plan: page.querySelector('#mfPlan').value.trim() || 'Direct Growth',
      months: parseInt(page.querySelector('#mfMonths').value) || null,
      invested, current,
      xirr: page.querySelector('#mfXirr').value !== '' ? parseFloat(page.querySelector('#mfXirr').value) : null,
    };
    if(idx === null){ HOLDINGS.mutualFunds.push(record); }
    else { HOLDINGS.mutualFunds[idx] = record; }
    recomputeHoldingTotals();
    saveHoldingsToLocalStorage();
    renderPortfolioPage();
  });
}

function wireEqForm(idx){
  const page = document.getElementById('p1');
  page.querySelector('#eqCancelBtn').addEventListener('click', () => {
    page.querySelector('#eqFormSlot').innerHTML = '';
  });
  page.querySelector('#eqSaveBtn').addEventListener('click', () => {
    const name = page.querySelector('#eqName').value.trim();
    const invested = parseFloat(page.querySelector('#eqInvested').value);
    const current = parseFloat(page.querySelector('#eqCurrent').value);
    if(!name || isNaN(invested) || isNaN(current)){
      alert('Please fill in at least the name, invested amount, and current value.');
      return;
    }
    const record = {
      name,
      symbol: page.querySelector('#eqSymbol').value.trim().toUpperCase(),
      qty: parseFloat(page.querySelector('#eqQty').value) || 0,
      avgPrice: parseFloat(page.querySelector('#eqAvgPrice').value) || 0,
      invested, current,
    };
    if(idx === null){ HOLDINGS.equity.push(record); }
    else { HOLDINGS.equity[idx] = record; }
    recomputeHoldingTotals();
    saveHoldingsToLocalStorage();
    renderPortfolioPage();
  });
}

// ============================================================
// PAGE 2 — 20-YEAR WEALTH PROJECTOR
// ============================================================
function pageProjector(){
  return `
    <div class="page-eyebrow">Page 02 · Long-Term View</div>
    <h1 class="page-title">If You Keep Investing Like This For 20 Years</h1>
    <p class="page-sub">Set your monthly SIP and step-up, and watch three scenarios play out — what happens if markets disappoint, meet expectations, or surprise you. This is the single most important chart in this dashboard.</p>

    <div class="card card-pad-lg mb-24">
      <div class="grid grid-3 mb-16">
        <div class="control-group" style="margin-bottom:0;">
          <div class="control-label"><span>Monthly SIP amount</span><span class="control-value" id="projSipVal">₹15,000</span></div>
          <input type="range" id="projSip" min="10000" max="20000" step="500" value="15000">
          <div class="range-minmax"><span>₹10,000</span><span>₹20,000</span></div>
        </div>
        <div class="control-group" style="margin-bottom:0;">
          <div class="control-label"><span>Annual step-up (raise SIP each year)</span><span class="control-value" id="projStepVal">10%</span></div>
          <input type="range" id="projStep" min="0" max="20" step="1" value="10">
          <div class="range-minmax"><span>0%</span><span>20%</span></div>
        </div>
        <div class="control-group" style="margin-bottom:0;">
          <div class="control-label"><span>Time horizon</span><span class="control-value" id="projYearsVal">20 yrs</span></div>
          <input type="range" id="projYears" min="5" max="30" step="1" value="20">
          <div class="range-minmax"><span>5 yrs</span><span>30 yrs</span></div>
        </div>
      </div>

      <div class="chart-box h-420"><canvas id="chartProjector"></canvas></div>
      <div class="scenario-legend" id="projLegend"></div>

      <div class="grid grid-3 mt-16">
        <div class="stat-tile" style="border-color:var(--rust);">
          <div class="stat-label" style="color:var(--rust)">Pessimistic · 8% CAGR</div>
          <div class="stat-value mono" id="projOutPess">—</div>
          <div class="stat-foot">Total invested: <span id="projInvestedPess">—</span></div>
        </div>
        <div class="stat-tile" style="border-color:var(--teal);box-shadow:var(--shadow-lg);">
          <div class="stat-label" style="color:var(--teal)">Expected · 12% CAGR</div>
          <div class="stat-value mono" id="projOutExp">—</div>
          <div class="stat-foot">Total invested: <span id="projInvestedExp">—</span></div>
        </div>
        <div class="stat-tile" style="border-color:var(--gold);">
          <div class="stat-label" style="color:#8a6516">Optimistic · 15% CAGR</div>
          <div class="stat-value mono" id="projOutOpt">—</div>
          <div class="stat-foot">Total invested: <span id="projInvestedOpt">—</span></div>
        </div>
      </div>
    </div>

    <div class="callout mb-24" id="projInsight"></div>

    <div class="two-col">
      <div class="card">
        <div class="section-title">Why three scenarios, not one number</div>
        <div class="section-desc" style="margin-bottom:0;">
          Equity markets don't move in a straight line. The 8% / 12% / 15% bands roughly correspond to: a prolonged weak decade (like 2010s US large-cap), India's long-run blended equity+debt average, and a strong multi-decade Indian equity run respectively. Your actual result will wander between these lines, not sit neatly on the middle one — which is exactly why staying invested through the dips matters more than picking the "best" fund.
        </div>
      </div>
      <div class="card">
        <div class="section-title">What a step-up actually buys you</div>
        <div class="section-desc" style="margin-bottom:0;">
          A 10% annual step-up roughly doubles your effective contribution by year 10 without feeling painful month to month — most people's salaries grow at least that fast. Try sliding the step-up to 0% and back to 10% above and watch the expected-case number move; the gap is usually far bigger than people expect.
        </div>
      </div>
    </div>

    <div class="disclaimer-box">
      Projections assume monthly compounding (SIP future value formula) with the annual step-up applied at each anniversary. Real returns will not be smooth or linear — actual portfolios go through multi-year drawdowns even in the "optimistic" long-run case. These are illustrative scenarios, not guarantees or promises of return.
    </div>
  `;
}

function sipFutureValue(monthlySip, annualRatePct, years, stepUpPct){
  const monthlyRate = annualRatePct / 100 / 12;
  let corpus = 0;
  let invested = 0;
  let currentSip = monthlySip;
  const yearlyData = [];
  for(let y = 1; y <= years; y++){
    for(let m = 0; m < 12; m++){
      corpus = corpus * (1 + monthlyRate) + currentSip;
      invested += currentSip;
    }
    yearlyData.push({ year: y, value: corpus, invested: invested });
    currentSip = currentSip * (1 + stepUpPct/100);
  }
  return yearlyData;
}

function initProjectorPage(){
  const sipSlider = document.getElementById('projSip');
  const stepSlider = document.getElementById('projStep');
  const yearsSlider = document.getElementById('projYears');
  const ctx = document.getElementById('chartProjector');

  function render(){
    const sip = parseInt(sipSlider.value);
    const step = parseInt(stepSlider.value);
    const years = parseInt(yearsSlider.value);

    document.getElementById('projSipVal').textContent = fmtINR(sip);
    document.getElementById('projStepVal').textContent = step + '%';
    document.getElementById('projYearsVal').textContent = years + ' yrs';

    const pess = sipFutureValue(sip, SCENARIOS.pessimistic.rate, years, step);
    const exp = sipFutureValue(sip, SCENARIOS.expected.rate, years, step);
    const opt = sipFutureValue(sip, SCENARIOS.optimistic.rate, years, step);

    const labels = pess.map(d => 'Yr ' + d.year);

    document.getElementById('projOutPess').textContent = fmtINR(pess[pess.length-1].value);
    document.getElementById('projOutExp').textContent = fmtINR(exp[exp.length-1].value);
    document.getElementById('projOutOpt').textContent = fmtINR(opt[opt.length-1].value);
    document.getElementById('projInvestedPess').textContent = fmtINR(pess[pess.length-1].invested);
    document.getElementById('projInvestedExp').textContent = fmtINR(exp[exp.length-1].invested);
    document.getElementById('projInvestedOpt').textContent = fmtINR(opt[opt.length-1].invested);

    const investedLine = exp.map(d => d.invested);

    if(CHARTS.projector) CHARTS.projector.destroy();
    CHARTS.projector = new Chart(ctx, {
      type:'line',
      data:{
        labels,
        datasets:[
          { label:'Optimistic (15%)', data: opt.map(d=>d.value), borderColor: SCENARIOS.optimistic.color, backgroundColor: SCENARIOS.optimistic.color+'18', fill:'+1', tension:0.3, pointRadius:0, borderWidth:2 },
          { label:'Expected (12%)', data: exp.map(d=>d.value), borderColor: SCENARIOS.expected.color, backgroundColor: SCENARIOS.expected.color+'22', fill:'+1', tension:0.3, pointRadius:0, borderWidth:2.5 },
          { label:'Pessimistic (8%)', data: pess.map(d=>d.value), borderColor: SCENARIOS.pessimistic.color, backgroundColor: SCENARIOS.pessimistic.color+'18', fill:false, tension:0.3, pointRadius:0, borderWidth:2 },
          { label:'Total invested (capital only)', data: investedLine, borderColor: '#9099A4', borderDash:[5,4], pointRadius:0, borderWidth:1.5, fill:false },
        ]
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        interaction:{mode:'index', intersect:false},
        scales:{
          y:{ ticks:{ callback:(v)=> '₹'+(v/100000).toFixed(0)+'L' }, grid:{color:'#EDE8DB'} },
          x:{ grid:{display:false}, ticks:{maxTicksLimit:10} }
        },
        plugins:{
          legend:{display:false},
          tooltip:{ callbacks:{ label:(c)=> ` ${c.dataset.label}: ${fmtINR(c.raw)}` } }
        }
      }
    });

    document.getElementById('projLegend').innerHTML = `
      <span class="legend-item"><span class="legend-dot" style="background:${SCENARIOS.optimistic.color}"></span>Optimistic (15%)</span>
      <span class="legend-item"><span class="legend-dot" style="background:${SCENARIOS.expected.color}"></span>Expected (12%)</span>
      <span class="legend-item"><span class="legend-dot" style="background:${SCENARIOS.pessimistic.color}"></span>Pessimistic (8%)</span>
      <span class="legend-item"><span class="legend-dot" style="background:#9099A4"></span>Capital invested</span>
    `;

    const multiple = (exp[exp.length-1].value / exp[exp.length-1].invested).toFixed(1);
    const gain = exp[exp.length-1].value - exp[exp.length-1].invested;
    document.getElementById('projInsight').innerHTML = `
      <span class="callout-title">At ₹${sip.toLocaleString('en-IN')}/month with a ${step}% yearly step-up over ${years} years</span>
      You'd invest ${fmtINR(exp[exp.length-1].invested)} of your own money and, in the expected scenario, end up with roughly <b>${fmtINR(exp[exp.length-1].value)}</b> — about <b>${multiple}×</b> your invested capital, with <b>${fmtINR(gain)}</b> being pure growth, not money you put in. That gap between the dashed line and the solid green line is what compounding is actually doing for you.
    `;
  }

  [sipSlider, stepSlider, yearsSlider].forEach(el => el.addEventListener('input', render));
  render();
}

// ============================================================
// PAGE 3 — SIP & RETURN CALCULATOR (multi-fund overlay)
// ============================================================
function pageCalculator(){
  // Flatten all funds across all categories for the comparison picker
  const allFunds = [];
  Object.keys(FUNDS).forEach(cat => {
    FUNDS[cat].forEach(f => allFunds.push({...f, cat}));
  });

  return `
    <div class="page-eyebrow">Page 03 · Calculator</div>
    <h1 class="page-title">SIP &amp; Return Calculator</h1>
    <p class="page-sub">Pick any funds from across every category and overlay them on one chart, using each fund's own actual 5-year (or 3-year) track record. See exactly how your SIP would have grown in each one, side by side.</p>

    <div class="card card-pad-lg mb-24">
      <div class="grid grid-2 mb-16">
        <div class="control-group" style="margin-bottom:0;">
          <div class="control-label"><span>Monthly SIP amount</span><span class="control-value" id="calcSipVal">₹15,000</span></div>
          <input type="range" id="calcSip" min="10000" max="20000" step="500" value="15000">
          <div class="range-minmax"><span>₹10,000</span><span>₹20,000</span></div>
        </div>
        <div class="control-group" style="margin-bottom:0;">
          <div class="control-label"><span>Investment period</span><span class="control-value" id="calcYearsVal">10 yrs</span></div>
          <input type="range" id="calcYears" min="1" max="20" step="1" value="10">
          <div class="range-minmax"><span>1 yr</span><span>20 yrs</span></div>
        </div>
      </div>

      <div class="control-group">
        <div class="control-label"><span>Compare funds (pick up to 5)</span></div>
        <div class="tag-row" id="fundPicker">
          ${allFunds.map((f,i) => `<span class="tag ${i<3?'active':''}" data-idx="${i}" data-cat="${f.cat}">${f.name}</span>`).join('')}
        </div>
      </div>

      <div class="chart-box h-380"><canvas id="chartCalc"></canvas></div>
      <div class="legend-row" id="calcLegend" style="margin-top:14px;"></div>
    </div>

    <div class="card mb-24">
      <div class="section-title">Result breakdown</div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Fund</th><th class="num">Used Return (CAGR)</th><th class="num">Invested</th><th class="num">Projected Value</th><th class="num">Gain</th></tr></thead>
          <tbody id="calcResultsBody"></tbody>
        </table>
      </div>
    </div>

    <div class="callout note">
      <span class="callout-title">How this calculator works</span>
      Each fund's projection uses its own actual 3-year CAGR as a proxy for future annual return (5-year where available and more stable, else 3-year) — not a generic assumption. This means the chart reflects real differences in each fund's track record, fund category risk, and cost structure. Past performance, of course, is not a guarantee of future returns; this is meant to help you compare funds on equal footing, not to predict outcomes.
    </div>

    <div class="disclaimer-box">
      Calculations use the standard SIP future-value formula with monthly compounding, holding the SIP amount flat for the period (no step-up here, to isolate pure fund-vs-fund comparison). For a step-up scenario, use the projector on Page 02.
    </div>
  `;
}

function sipFlatFutureValue(monthlySip, annualRatePct, years){
  const months = years * 12;
  const monthlyRate = annualRatePct / 100 / 12;
  let corpus = 0;
  for(let m=0;m<months;m++){ corpus = corpus * (1+monthlyRate) + monthlySip; }
  return corpus;
}

function initCalculatorPage(){
  const sipSlider = document.getElementById('calcSip');
  const yearsSlider = document.getElementById('calcYears');
  const ctx = document.getElementById('chartCalc');
  const picker = document.getElementById('fundPicker');

  const allFunds = [];
  Object.keys(FUNDS).forEach(cat => { FUNDS[cat].forEach(f => allFunds.push({...f, cat})); });

  const palette = ['#1A6F5C','#C8932A','#B6452C','#3B5BA9','#7B5EA7','#2D8F8F','#A35D2E'];

  picker.addEventListener('click', (e) => {
    if(!e.target.classList.contains('tag')) return;
    const activeCount = picker.querySelectorAll('.tag.active').length;
    if(!e.target.classList.contains('active') && activeCount >= 5){
      return; // cap at 5
    }
    e.target.classList.toggle('active');
    render();
  });

  function render(){
    const sip = parseInt(sipSlider.value);
    const years = parseInt(yearsSlider.value);
    document.getElementById('calcSipVal').textContent = fmtINR(sip);
    document.getElementById('calcYearsVal').textContent = years + ' yrs';

    const activeTags = [...picker.querySelectorAll('.tag.active')];
    const selected = activeTags.map(t => allFunds[parseInt(t.dataset.idx)]);

    const labels = Array.from({length: years+1}, (_,i) => i===0 ? 'Start' : 'Yr '+i);

    const datasets = selected.map((f, i) => {
      const rate = f.r5 || f.r3; // prefer 5Y, fallback 3Y
      const series = [0];
      for(let y=1;y<=years;y++) series.push(sipFlatFutureValue(sip, rate, y));
      return {
        label: f.name,
        data: series,
        borderColor: palette[i % palette.length],
        backgroundColor: palette[i % palette.length]+'15',
        tension:0.3, pointRadius:0, borderWidth:2.2, fill:false,
      };
    });

    if(CHARTS.calc) CHARTS.calc.destroy();
    CHARTS.calc = new Chart(ctx, {
      type:'line',
      data:{ labels, datasets },
      options:{
        responsive:true, maintainAspectRatio:false,
        interaction:{mode:'index', intersect:false},
        scales:{
          y:{ ticks:{ callback:(v)=> '₹'+(v/100000).toFixed(1)+'L' }, grid:{color:'#EDE8DB'} },
          x:{ grid:{display:false}, ticks:{maxTicksLimit:10} }
        },
        plugins:{ legend:{display:false}, tooltip:{ callbacks:{ label:(c)=> ` ${c.dataset.label}: ${fmtINR(c.raw)}` } } }
      }
    });

    document.getElementById('calcLegend').innerHTML = selected.map((f,i) => `<span class="legend-item"><span class="legend-dot" style="background:${palette[i%palette.length]}"></span>${f.name}</span>`).join('');

    const invested = sip * years * 12;
    document.getElementById('calcResultsBody').innerHTML = selected.map((f,i) => {
      const rate = f.r5 || f.r3;
      const value = sipFlatFutureValue(sip, rate, years);
      const gain = value - invested;
      return `<tr>
        <td class="fund-name"><span class="legend-dot" style="background:${palette[i%palette.length]};margin-right:6px;"></span>${f.name}</td>
        <td class="num">${rate.toFixed(2)}%</td>
        <td class="num">${fmtINR(invested)}</td>
        <td class="num" style="font-weight:600;">${fmtINR(value)}</td>
        <td class="num" style="color:var(--teal)">${fmtINR(gain)}</td>
      </tr>`;
    }).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--slate-light);padding:24px;">Select at least one fund above to see projections.</td></tr>';
  }

  [sipSlider, yearsSlider].forEach(el => el.addEventListener('input', render));
  render();
}

// ============================================================
// PAGES 4-9 — FUND CATEGORY COMPARISON PAGES
// ============================================================

const CATEGORY_META = {
  multiAsset: {
    pageNum: '04',
    icon: '◆',
    verdictIdx: 1, // Nippon India
    verdictReasons: [
      { mark:'Rs', text:'<b>Lowest expense ratio (0.45%)</b> among major multi-asset funds — more of your return stays yours every year, compounding over decades.' },
      { mark:'A', text:'<b>Highest alpha in the category</b> — it has genuinely outperformed what its risk level would predict, not just ridden a lucky market.' },
      { mark:'B', text:'<b>Balanced 60/25/15 mix</b> across equity, debt, and gold/commodities — diversified enough to cushion a sharp equity correction.' },
      { mark:'T', text:'<b>Track record since 2010</b> — has lived through multiple market cycles including 2020 and 2022, not just a recent bull run.' },
    ],
  },
  flexiCap: {
    pageNum: '05',
    icon: '◆',
    verdictIdx: 0, // Parag Parikh
    verdictReasons: [
      { mark:'C', text:'<b>Best consistency record in the category</b> — 100% of rolling 5-year windows since 2013 returned above 12%, the steadiest long-run track record here.' },
      { mark:'G', text:'<b>Only major flexi cap with global exposure</b> (holds US names like Alphabet) — this diversifies outside India-only risk, which most peers don\'t offer.' },
      { mark:'S', text:'<b>~20% debt cushion</b> built into the fund keeps volatility lower than a pure-equity flexi cap during corrections.' },
      { mark:'M', text:'<b>Same fund manager since inception</b> (2013) — no style drift or strategy changes from a manager switch, which is common elsewhere.' },
    ],
  },
  smallCap: {
    pageNum: '06',
    icon: '◆',
    verdictIdx: 1, // Bandhan
    verdictReasons: [
      { mark:'R', text:'<b>Best 3-year return in the category (29.17%)</b> while keeping meaningfully better drawdown control than the highest-return fund in this set (Quant).' },
      { mark:'D', text:'<b>Max drawdown of -24.1%</b> vs Quant\'s -38.4% — in small caps, that gap is the difference between an uncomfortable year and a genuinely scary one.' },
      { mark:'!', text:'Worth noting: Quant Small Cap still has the better raw 5-year number (35.2% vs 22.26%) here — this is a risk-adjusted call, not a "this one is strictly better" call.' },
      { mark:'X', text:'Small caps in general should stay a <b>small slice (10-15%)</b> of any portfolio regardless of which specific fund you pick — the category risk dominates the fund choice here.' },
    ],
  },
  index: {
    pageNum: '07',
    icon: '◆',
    verdictIdx: 1, // ICICI Pru Nifty 50
    verdictReasons: [
      { mark:'Rs', text:'<b>Best cost-to-tracking balance</b>: 0.15% expense ratio with just 0.06% tracking error — you keep almost all of the index\'s actual return.' },
      { mark:'H', text:'<b>Top-tier AMC backing</b> with ₹9,500 Cr+ AUM — large enough for zero liquidity concerns at any retail investment size.' },
      { mark:'I', text:'No fund-manager risk by design — your return is the Nifty 50\'s return, minus a tiny, transparent cost. <b>Zero surprises</b> over 20 years.' },
      { mark:'L', text:'If absolute lowest cost matters most to you, <b>Navi Nifty 50 (0.06%)</b> is worth a look too — newer fund, smaller track record, but a genuinely lower fee.' },
    ],
  },
  elss: {
    pageNum: '08',
    icon: '◆',
    verdictIdx: 1, // Quant ELSS
    verdictReasons: [
      { mark:'P', text:'<b>Strong, consistent mid-to-high teens returns</b> across both 3-year (17.0%) and 5-year (18.8%) horizons — not a one-year fluke.' },
      { mark:'!', text:'If you already hold a Quant fund elsewhere in your portfolio, weigh the correlation. <b>Motilal Oswal ELSS</b> (22.2% 1Y) is a strong alternative if you\'d rather not double up on one AMC\'s style.' },
      { mark:'K', text:'Standard <b>3-year lock-in</b> applies to every ELSS fund regardless of which you pick — factor this into how much you commit here vs. a non-locked equity fund.' },
      { mark:'Rs', text:'Up to <b>₹1.5 lakh/year deduction</b> under Section 80C — worth prioritizing if you haven\'t used this year\'s 80C limit yet through any other instrument.' },
    ],
  },
  hybrid: {
    pageNum: '09',
    icon: '◆',
    verdictIdx: 1, // HDFC BAF
    verdictReasons: [
      { mark:'H', text:'<b>The most established balanced advantage fund</b> in the market — long track record across multiple full market cycles, including 2020 and 2022.' },
      { mark:'D', text:'The negative 1-year return isn\'t a red flag — it\'s the fund <b>doing its job</b>: cutting equity exposure when valuations look rich, exactly the discipline retail investors usually fail to apply themselves.' },
      { mark:'B', text:'If you want exposure to debt+equity in one fund without picking the asset mix yourself, this is the <b>lowest-effort, most-tested</b> option in the category.' },
      { mark:'X', text:'Consider this as a <b>satellite holding (10-20%)</b> alongside your equity funds, not a replacement for them — it\'s built for smoothing, not for maximizing growth.' },
    ],
  },
};

// Checks whether any fund the user has actually entered on Page 1
// matches (by name overlap) a fund in this category's comparison
// table. Returns the matching HOLDINGS entry, or null.
function findOwnedFundInCategory(catKey){
  const funds = FUNDS[catKey];
  for(const held of HOLDINGS.mutualFunds){
    const heldNameWords = held.name.toLowerCase().split(' ').filter(w=>w.length>3);
    for(const f of funds){
      const fNameLower = f.name.toLowerCase();
      const matchCount = heldNameWords.filter(w => fNameLower.includes(w)).length;
      if(matchCount >= 2) return { held, catalogFund: f };
    }
  }
  return null;
}

function pageFundCategory(catKey, title, subtitle){
  const meta = CATEGORY_META[catKey];
  const funds = FUNDS[catKey];
  const isMultiAssetOrHybrid = catKey === 'multiAsset' || catKey === 'hybrid';
  const verdict = funds[meta.verdictIdx];
  const ownedMatch = findOwnedFundInCategory(catKey);

  const ownedBanner = ownedMatch ? `
    <div class="callout mb-24">
      <span class="callout-title">You already hold a fund in this category</span>
      <b>${ownedMatch.held.name}</b> is in your portfolio (Page 01) right now. It's included in the comparison table below, marked clearly, so you can see exactly how it stacks up against the rest of the category.
    </div>` : '';

  return `
    <div class="page-eyebrow">Page ${meta.pageNum} · Fund Comparison</div>
    <h1 class="page-title">${title}</h1>
    <p class="page-sub">${subtitle}</p>
    ${ownedBanner}

    <div class="card mb-24">
      <div class="section-title">All major funds in this category, compared</div>
      <div class="section-desc">Sorted by 3-year return. Expense ratio shown is for the Direct plan — always choose Direct over Regular to avoid distributor commissions eating into your returns.</div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fund</th>
              <th class="num">1Y Return</th>
              <th class="num">3Y CAGR</th>
              <th class="num">5Y CAGR</th>
              <th class="num">Expense Ratio</th>
              ${isMultiAssetOrHybrid ? '<th class="num">Equity/Debt/Other</th>' : ''}
              <th class="num">Rating</th>
            </tr>
          </thead>
          <tbody>
            ${funds.map((f, i) => {
              const isOwned = ownedMatch && ownedMatch.catalogFund.name === f.name;
              return `
              <tr class="${isOwned ? 'row-highlight' : ''}">
                <td class="fund-name">${f.name}${isOwned ? ' <span class="pill pill-gold">You own this</span>' : ''}<span class="fund-sub">${f.amc}</span></td>
                <td class="num" style="color:${f.r1>=0?'var(--teal)':'var(--rust)'}">${fmtPct(f.r1)}</td>
                <td class="num">${f.r3.toFixed(2)}%</td>
                <td class="num">${f.r5 ? f.r5.toFixed(2)+'%' : 'N/A'}</td>
                <td class="num">${f.expense.toFixed(2)}%</td>
                ${isMultiAssetOrHybrid ? `<td class="num">${f.equityAlloc}% / ${f.debtAlloc}% / ${f.otherAlloc}%</td>` : ''}
                <td class="num">${stars(f.rating)}</td>
              </tr>
            `;}).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="two-col mb-24">
      <div class="card">
        <div class="section-title">Returns at a glance</div>
        <div class="chart-box h-320"><canvas id="chartCat_${catKey}"></canvas></div>
      </div>
      <div class="card">
        <div class="section-title">Cost vs. 3Y return</div>
        <div class="section-desc">Bottom-right is the sweet spot: low cost, high return.</div>
        <div class="chart-box h-320"><canvas id="chartScatter_${catKey}"></canvas></div>
      </div>
    </div>

    <div class="card mb-24">
      <div class="section-title">What each fund actually does differently</div>
      <div class="grid grid-2">
        ${funds.map(f => {
          const isOwned = ownedMatch && ownedMatch.catalogFund.name === f.name;
          return `
          <div class="callout ${isOwned ? 'note' : ''}" style="margin-bottom:0;">
            <span class="callout-title">${f.name}${isOwned ? ' — You own this' : ''}</span>
            ${f.note}
          </div>
        `;}).join('')}
      </div>
    </div>

    <div class="verdict-card">
      <div class="verdict-eyebrow">Our read · ${title}</div>
      <div class="verdict-fund">${verdict.name}</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.7);max-width:600px;">
        Based on the data above — returns, cost, risk-adjustment, and consistency — this is the strongest all-around pick in this category for a long-term SIP investor. Not the only reasonable choice, but the one with the fewest trade-offs.
      </div>
      <div class="verdict-reasons">
        ${meta.verdictReasons.map(r => `
          <div class="verdict-reason">
            <span class="verdict-reason-mark">${r.mark}</span>
            <span class="verdict-reason-text">${r.text}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="disclaimer-box">
      Returns and expense ratios reflect data gathered as of June 2026 from public fund-tracking sources (Value Research, Tickertape, AMC factsheets, Groww category pages). These figures move over time — always check the live NAV and factsheet before investing. This is analysis to support your own decision, not a personalized recommendation; consider your own risk tolerance, goals, and (if needed) a SEBI-registered advisor.
    </div>
  `;
}

function initFundCategoryCharts(catKey){
  const funds = FUNDS[catKey];
  const ctxBar = document.getElementById('chartCat_'+catKey);
  const ctxScatter = document.getElementById('chartScatter_'+catKey);
  if(!ctxBar || !ctxScatter) return;

  if(CHARTS['cat_'+catKey]) CHARTS['cat_'+catKey].destroy();
  CHARTS['cat_'+catKey] = new Chart(ctxBar, {
    type:'bar',
    data:{
      labels: funds.map(f => f.name.split(' ').slice(0,3).join(' ')),
      datasets:[
        { label:'3Y CAGR', data: funds.map(f=>f.r3), backgroundColor:'#1A6F5C', borderRadius:4 },
        { label:'5Y CAGR', data: funds.map(f=>f.r5||0), backgroundColor:'#C8932A', borderRadius:4 },
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      scales:{ y:{ ticks:{callback:(v)=>v+'%'}, grid:{color:'#EDE8DB'} }, x:{ grid:{display:false}, ticks:{font:{size:10}} } },
      plugins:{ legend:{position:'top', labels:{boxWidth:10,font:{size:11}}} }
    }
  });

  if(CHARTS['scatter_'+catKey]) CHARTS['scatter_'+catKey].destroy();
  CHARTS['scatter_'+catKey] = new Chart(ctxScatter, {
    type:'scatter',
    data:{
      datasets:[{
        label:'Funds',
        data: funds.map(f => ({x:f.expense, y:f.r3, label:f.name})),
        backgroundColor: '#1A6F5C',
        pointRadius:7,
        pointHoverRadius:9,
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      scales:{
        x:{ title:{display:true,text:'Expense Ratio (%)',font:{size:11}}, grid:{color:'#EDE8DB'} },
        y:{ title:{display:true,text:'3Y CAGR (%)',font:{size:11}}, grid:{color:'#EDE8DB'} },
      },
      plugins:{
        legend:{display:false},
        tooltip:{ callbacks:{ label:(c)=> ` ${c.raw.label}: ${c.raw.x}% cost, ${c.raw.y}% return` } }
      }
    }
  });
}

function initFundPages(){
  Object.keys(FUNDS).forEach(catKey => initFundCategoryCharts(catKey));
}

// ============================================================
// PAGE 10 — RECOMMENDED PORTFOLIO
// ============================================================
const RECOMMENDED_MIX = [
  { sleeve:'Flexi Cap', pct:30, fund:'Parag Parikh Flexi Cap Fund', why:'You already hold this — keep it as your equity core.', color:'#1A6F5C', status:'keep' },
  { sleeve:'Nifty 50 Index', pct:25, fund:'ICICI Prudential Nifty 50 Index Fund', why:'Low-cost, low-drama large-cap base to anchor the portfolio.', color:'#C8932A', status:'add' },
  { sleeve:'Multi Asset', pct:20, fund:'Nippon India Multi Asset Allocation Fund', why:'Cushions the equity-heavy sleeves with debt + gold automatically.', color:'#3B5BA9', status:'add' },
  { sleeve:'Small Cap', pct:15, fund:'Quant Small Cap Fund', why:'You already hold this — keep, but don\'t let it grow past ~15% of total.', color:'#B6452C', status:'keep' },
  { sleeve:'ELSS (if 80C not used)', pct:10, fund:'Quant or Motilal Oswal ELSS', why:'Only add this sleeve if you haven\'t exhausted your ₹1.5L Section 80C limit elsewhere.', color:'#7B5EA7', status:'conditional' },
];

function pageRecommended(){
  const h = HOLDINGS;
  const hasAny = h.mutualFunds.length > 0 || h.equity.length > 0;
  const subtitle = hasAny
    ? "Not a generic model portfolio — this one builds outward from the holdings you've added on Page 01, so you're adding deliberately rather than starting over."
    : "A generic, reasonable starting framework for a long-horizon SIP investor at ₹10,000–20,000/month. Add your own holdings on Page 01 and this view will adapt around them.";

  const equityCalloutText = h.equity.length > 0
    ? `You've added ${h.equity.length} stock/ETF holding${h.equity.length===1?'':'s'} worth ${fmtINR(h.totalEquityCurrent)} currently. If any single position is a small, speculative bet, it's worth deciding deliberately whether you're holding it for a specific thesis — see the action plan on the next page.`
    : `You haven't added any individual stocks or ETFs on Page 01. That's completely fine for a long-term SIP plan — mutual funds alone can carry the full strategy without needing direct stock-picking.`;

  return `
    <div class="page-eyebrow">Page 10 · Your Plan</div>
    <h1 class="page-title">A Portfolio Built Around What You Already Hold</h1>
    <p class="page-sub">${subtitle}</p>

    <div class="two-col mb-24">
      <div class="card">
        <div class="section-title">Suggested allocation</div>
        <div class="section-desc">A reasonable split for a long-horizon SIP investor at ₹10,000–20,000/month. Adjust the weights to your own comfort — this is a starting framework, not a rule.</div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Sleeve</th><th class="num">Target %</th><th>Suggested fund</th><th>Status</th></tr></thead>
            <tbody>
              ${RECOMMENDED_MIX.map(m => `
                <tr>
                  <td class="fund-name"><span class="legend-dot" style="background:${m.color};margin-right:8px;"></span>${m.sleeve}</td>
                  <td class="num">${m.pct}%</td>
                  <td style="white-space:normal;font-size:12.5px;">${m.fund}</td>
                  <td>${m.status==='keep' ? '<span class="pill pill-teal">Keep</span>' : m.status==='add' ? '<span class="pill pill-gold">Add</span>' : '<span class="pill pill-slate">Conditional</span>'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      <div class="card">
        <div class="chart-box h-320"><canvas id="chartRecommended"></canvas></div>
        <div class="legend-row" id="recLegend" style="margin-top:14px;justify-content:center;"></div>
      </div>
    </div>

    <div class="card mb-24 card-pad-lg">
      <div class="section-title">How to split your ₹10,000–20,000 monthly SIP</div>
      <div class="section-desc">Using the allocation above, here's what that looks like in rupees at three different monthly amounts.</div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Sleeve</th><th class="num">At ₹10,000/mo</th><th class="num">At ₹15,000/mo</th><th class="num">At ₹20,000/mo</th></tr></thead>
          <tbody>
            ${RECOMMENDED_MIX.map(m => `
              <tr>
                <td class="fund-name">${m.sleeve}</td>
                <td class="num">${fmtINR(10000 * m.pct/100)}</td>
                <td class="num">${fmtINR(15000 * m.pct/100)}</td>
                <td class="num">${fmtINR(20000 * m.pct/100)}</td>
              </tr>
            `).join('')}
            <tr class="row-highlight">
              <td class="fund-name">Total</td>
              <td class="num">₹10,000</td>
              <td class="num">₹15,000</td>
              <td class="num">₹20,000</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="grid grid-2 mb-24">
      <div class="callout">
        <span class="callout-title">Why this mix, not an all-equity one</span>
        At ₹10K-20K/month with a 20-year horizon, you can afford to be equity-heavy — but 100% equity with no multi-asset cushion means every correction tests your nerve at full force. The 20% multi-asset sleeve isn't there to maximize returns; it's there so you don't panic-sell the equity sleeves during a bad year.
      </div>
      <div class="callout note">
        <span class="callout-title">On your stock/ETF holdings</span>
        ${equityCalloutText}
      </div>
    </div>

    <div class="disclaimer-box">
      This allocation is a structured starting framework based on your stated income, SIP capacity, and any holdings you've added — not a personalized recommendation from a SEBI-registered investment advisor. Consider consulting one before making large allocation changes, especially around tax-saving (ELSS) and existing position decisions.
    </div>
  `;
}

function initRecommendedPage(){
  const ctx = document.getElementById('chartRecommended');
  if(!ctx) return;
  CHARTS.recommended = new Chart(ctx, {
    type:'doughnut',
    data:{
      labels: RECOMMENDED_MIX.map(m=>m.sleeve),
      datasets:[{ data: RECOMMENDED_MIX.map(m=>m.pct), backgroundColor: RECOMMENDED_MIX.map(m=>m.color), borderWidth:3, borderColor:'#fff' }]
    },
    options:{
      responsive:true, maintainAspectRatio:false, cutout:'58%',
      plugins:{ legend:{display:false}, tooltip:{callbacks:{label:(c)=>` ${c.label}: ${c.raw}%`}} }
    }
  });
  document.getElementById('recLegend').innerHTML = RECOMMENDED_MIX.map(m => `<span class="legend-item"><span class="legend-dot" style="background:${m.color}"></span>${m.sleeve} (${m.pct}%)</span>`).join('');
}

// ============================================================
// PAGE 11 — ACTION PLAN & GLOSSARY
// ============================================================
function findWorstPosition(){
  const all = [
    ...HOLDINGS.equity.map(e => ({ name: e.name, invested: e.invested, current: e.current, pnl: e.current - e.invested })),
    ...HOLDINGS.mutualFunds.map(f => ({ name: f.name, invested: f.invested, current: f.current, pnl: f.current - f.invested })),
  ];
  if(all.length === 0) return null;
  const worst = all.reduce((a,b) => (a.pnl < b.pnl ? a : b));
  return worst.pnl < 0 ? worst : null;
}

function pageActionPlan(){
  const worst = findWorstPosition();
  const item1 = worst
    ? {
        title: `1. Decide on ${worst.name}`,
        body: `Down ${fmtPct((worst.pnl/worst.invested)*100)} (${fmtINR(worst.pnl)}). Either form a clear reason to keep holding (a specific turnaround thesis) or exit and redeploy into your core funds. Holding purely out of "it might come back" is the costliest option.`
      }
    : {
        title: `1. Review your holdings regularly`,
        body: `You don't have any position currently underwater — good place to be. Make it a habit to check in monthly rather than daily; SIP investing rewards patience, and checking too often just adds noise.`
      };

  return `
    <div class="page-eyebrow">Page 11 · Next Steps</div>
    <h1 class="page-title">Action Plan &amp; Glossary</h1>
    <p class="page-sub">The concrete next steps, in order, plus plain-English definitions for every term used across this dashboard.</p>

    <div class="card mb-24 card-pad-lg">
      <div class="section-title">This month</div>
      <div class="grid grid-2">
        <div class="callout" style="margin-bottom:0;">
          <span class="callout-title">${item1.title}</span>
          ${item1.body}
        </div>
        <div class="callout" style="margin-bottom:0;">
          <span class="callout-title">2. Set your SIP amount</span>
          Pick a number between ₹10,000–20,000 you can sustain even in a lean month — consistency matters more than the exact amount. ₹15,000/month with a 10% step-up is a strong, realistic default given your salary.
        </div>
        <div class="callout note" style="margin-bottom:0;">
          <span class="callout-title">3. Add one new sleeve, not five</span>
          Don't try to build the full recommended portfolio in one week. Add the Nifty 50 Index fund SIP first — it's the simplest, lowest-risk addition — then layer in Multi Asset next month.
        </div>
        <div class="callout note" style="margin-bottom:0;">
          <span class="callout-title">4. Check your Section 80C usage</span>
          If you haven't used your ₹1.5 lakh 80C limit through PF, insurance, or other instruments, an ELSS SIP does double duty — tax saving and equity growth in one.
        </div>
      </div>
    </div>

    <div class="card mb-24">
      <div class="section-title">Glossary — every term used in this dashboard</div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Term</th><th>What it means</th></tr></thead>
          <tbody>
            <tr><td class="fund-name">SIP</td><td style="white-space:normal;">Systematic Investment Plan — investing a fixed amount on a fixed date every month, instead of one lump sum.</td></tr>
            <tr><td class="fund-name">XIRR</td><td style="white-space:normal;">The annualized return of your specific investment, accounting for exactly when each rupee went in and came out. More accurate than a simple % return for SIPs.</td></tr>
            <tr><td class="fund-name">CAGR</td><td style="white-space:normal;">Compound Annual Growth Rate — the smoothed yearly return that would take an investment from its starting to ending value over a period.</td></tr>
            <tr><td class="fund-name">NAV</td><td style="white-space:normal;">Net Asset Value — the price of one unit of a mutual fund, updated once daily after market close.</td></tr>
            <tr><td class="fund-name">Expense Ratio</td><td style="white-space:normal;">The annual fee the fund charges, as a % of your invested amount, for managing the fund. Lower is better, all else equal.</td></tr>
            <tr><td class="fund-name">AUM</td><td style="white-space:normal;">Assets Under Management — total money the fund manages. Larger AUM usually means more stability and liquidity.</td></tr>
            <tr><td class="fund-name">Direct vs Regular Plan</td><td style="white-space:normal;">Direct plans skip the distributor commission, so they have a lower expense ratio and slightly higher returns than Regular plans of the same fund.</td></tr>
            <tr><td class="fund-name">Sharpe Ratio</td><td style="white-space:normal;">Return earned per unit of risk taken. Higher is better — it means smoother returns for the same gain.</td></tr>
            <tr><td class="fund-name">Alpha</td><td style="white-space:normal;">Extra return a fund generated beyond what its risk level alone would predict. Positive alpha = genuine outperformance.</td></tr>
            <tr><td class="fund-name">Beta</td><td style="white-space:normal;">How much a fund moves relative to the overall market. Beta of 1 = moves with the market; below 1 = moves less (less volatile).</td></tr>
            <tr><td class="fund-name">Max Drawdown</td><td style="white-space:normal;">The largest peak-to-trough fall the fund has experienced. A useful gut-check for "can I handle this fund emotionally."</td></tr>
            <tr><td class="fund-name">Step-up SIP</td><td style="white-space:normal;">Increasing your SIP amount by a fixed % every year, usually in line with salary growth, to compound contributions faster.</td></tr>
            <tr><td class="fund-name">ELSS Lock-in</td><td style="white-space:normal;">A mandatory 3-year period during which ELSS fund units cannot be redeemed, in exchange for the tax deduction.</td></tr>
            <tr><td class="fund-name">Tracking Error</td><td style="white-space:normal;">For index funds — how far the fund's actual return strays from its benchmark index. Lower is better.</td></tr>
            <tr><td class="fund-name">LTCG / STCG</td><td style="white-space:normal;">Long-term / Short-term Capital Gains tax. For equity funds, gains after 1 year are LTCG (taxed lower); before that, STCG (taxed higher).</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="disclaimer-box">
      This dashboard uses holdings you've entered yourself, plus live fund market data gathered in June 2026. It is provided to support your own informed decision-making and is not personalized financial advice from a SEBI-registered advisor. Mutual fund investments are subject to market risk — please read scheme documents carefully before investing.
    </div>
  `;
}
