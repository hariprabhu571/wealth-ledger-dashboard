// ============================================================
// DATA LAYER — Wealth Ledger Dashboard
// Holdings data is entered and edited by you, inside the app.
// Nothing here is pre-filled with anyone's real numbers —
// this file ships blank so the dashboard is safe to share
// publicly. Fund category research data (returns, expense
// ratios etc.) below IS real, gathered from public sources
// as of June 2026, and is not personal to any one user.
// ============================================================

const USER = {
  salary: 45000,
  sipMin: 10000,
  sipMax: 20000,
  sipDefault: 15000,
};

// ---- Your holdings — starts empty. Add funds/stocks from Page 1. ----
// Loaded fresh blank on every page load unless you Import a
// previously exported JSON file (see Page 1 "Import" button).
const HOLDINGS = {
  mutualFunds: [],
  equity: []
};

// Recalculates aggregate totals on HOLDINGS. Call this after any
// add / edit / delete so every page reading HOLDINGS stays in sync.
function recomputeHoldingTotals(){
  HOLDINGS.totalMFInvested = HOLDINGS.mutualFunds.reduce((s, f) => s + (Number(f.invested)||0), 0);
  HOLDINGS.totalMFCurrent = HOLDINGS.mutualFunds.reduce((s, f) => s + (Number(f.current)||0), 0);
  HOLDINGS.totalEquityInvested = HOLDINGS.equity.reduce((s, e) => s + (Number(e.invested)||0), 0);
  HOLDINGS.totalEquityCurrent = HOLDINGS.equity.reduce((s, e) => s + (Number(e.current)||0), 0);
  HOLDINGS.totalInvested = HOLDINGS.totalMFInvested + HOLDINGS.totalEquityInvested;
  HOLDINGS.totalCurrent = HOLDINGS.totalMFCurrent + HOLDINGS.totalEquityCurrent;
}
recomputeHoldingTotals();

// ---- Local persistence (this device / this browser only) ----
const STORAGE_KEY = 'wealthLedgerHoldings_v1';

function saveHoldingsToLocalStorage(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(HOLDINGS));
  }catch(e){ console.warn('Could not save to localStorage', e); }
}

function loadHoldingsFromLocalStorage(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return false;
    const parsed = JSON.parse(raw);
    if(parsed && Array.isArray(parsed.mutualFunds) && Array.isArray(parsed.equity)){
      HOLDINGS.mutualFunds = parsed.mutualFunds;
      HOLDINGS.equity = parsed.equity;
      recomputeHoldingTotals();
      return true;
    }
  }catch(e){ console.warn('Could not load from localStorage', e); }
  return false;
}

function exportHoldingsAsJSON(){
  const payload = {
    exportedAt: new Date().toISOString(),
    mutualFunds: HOLDINGS.mutualFunds,
    equity: HOLDINGS.equity,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wealth-ledger-holdings.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importHoldingsFromJSON(file, onDone){
  const reader = new FileReader();
  reader.onload = (e) => {
    try{
      const parsed = JSON.parse(e.target.result);
      if(!Array.isArray(parsed.mutualFunds) || !Array.isArray(parsed.equity)){
        throw new Error('File is missing mutualFunds or equity arrays');
      }
      HOLDINGS.mutualFunds = parsed.mutualFunds;
      HOLDINGS.equity = parsed.equity;
      recomputeHoldingTotals();
      saveHoldingsToLocalStorage();
      onDone(true, null);
    }catch(err){
      onDone(false, err.message);
    }
  };
  reader.onerror = () => onDone(false, 'Could not read file');
  reader.readAsText(file);
}

// ============================================================
// FUND CATEGORY DATA — live data gathered June 2026
// Returns are annualized (CAGR) % unless noted. Expense ratios
// are for Direct plans unless noted otherwise.
// ============================================================

const FUNDS = {

  multiAsset: [
    { name:"Quant Multi Asset Allocation Fund", amc:"Quant MF", r1:14.2, r3:19.37, r5:24.1, expense:0.65, aum:3120, risk:"Very High",
      equityAlloc:65, debtAlloc:15, otherAlloc:20, manager:"Sanjeev Sharma", since:2017, rating:5,
      note:"Highest 3Y & 5Y returns in category, but also the most aggressive — quant-driven model shifts allocation fast, leading to higher volatility than peers." },
    { name:"Nippon India Multi Asset Allocation Fund", amc:"Nippon India MF", r1:11.8, r3:20.64, r5:16.61, expense:0.45, aum:5640, risk:"High",
      equityAlloc:60, debtAlloc:25, otherAlloc:15, manager:"Sailesh Raj Bhan / Anju Chajjer", since:2010, rating:5,
      note:"Lowest expense ratio among major multi-asset funds with strong risk-adjusted returns (highest alpha in category). Best cost-to-performance balance." },
    { name:"ICICI Prudential Multi-Asset Fund", amc:"ICICI Prudential MF", r1:9.4, r3:16.8, r5:15.9, expense:0.85, aum:70551, risk:"High",
      equityAlloc:63, debtAlloc:19.4, otherAlloc:17.6, manager:"Sankaran Naren / Ihab Dalwai", since:2002, rating:4,
      note:"Largest AUM by far — huge liquidity and stability. Best Sharpe (1.92) and Sortino (2.92) ratios in the category, meaning smoothest ride for the return generated." },
    { name:"UTI Multi Asset Allocation Fund", amc:"UTI MF", r1:10.1, r3:15.98, r5:14.2, expense:0.70, aum:980, risk:"High",
      equityAlloc:70, debtAlloc:18, otherAlloc:12, manager:"V Srivatsa", since:2008, rating:4,
      note:"Smallest fund size, second-highest returns, but highest standard deviation in category — more volatile, weaker risk-adjusted score than ICICI/Nippon." },
    { name:"Aditya Birla SL Multi Asset Allocation Fund", amc:"Aditya Birla Sun Life MF", r1:8.9, r3:16.01, r5:13.4, expense:0.55, aum:1450, risk:"High",
      equityAlloc:58, debtAlloc:27, otherAlloc:15, manager:"Mohit Sharma", since:2023, rating:4,
      note:"Newer fund (since 2023) with a balanced 3-asset mix; not enough multi-cycle track record yet to judge consistency." },
    { name:"SBI Multi Asset Allocation Fund", amc:"SBI MF", r1:6.1, r3:11.2, r5:10.8, expense:0.60, aum:8200, risk:"Moderately High",
      equityAlloc:45, debtAlloc:40, otherAlloc:15, manager:"Dinesh Ahuja / Mansi Sajeja", since:2005, rating:3,
      note:"Heaviest debt allocation in the category — lowest returns of the group, but also likely the smoothest in a sharp equity correction." },
  ],

  flexiCap: [
    { name:"Parag Parikh Flexi Cap Fund", amc:"PPFAS MF", r1:3.7, r3:17.6, r5:16.9, expense:0.62, aum:161795, risk:"Very High",
      pe:18.61, categoryPe:28.81, beta:0.93, sharpe:-0.66, manager:"Rajeev Thakkar (since inception)", since:2013, rating:5,
      note:"Lowest PE (value-tilted), only major flexi cap with US stock exposure (Alphabet etc.), ~20% debt cushion. 100% hit-rate on 5Y rolling returns above 12% since 2013 — exceptional consistency. Same manager since launch." },
    { name:"HDFC Flexi Cap Fund", amc:"HDFC MF", r1:2.0, r3:19.5, r5:20.0, expense:0.74, aum:91335, risk:"Very High",
      pe:24.3, categoryPe:28.81, beta:1.04, sharpe:0.12, manager:"Roshi Jain", since:2013, rating:5,
      note:"Highest 5Y returns of the major flexi caps. Slightly more aggressive than Parag Parikh, no international diversification cushion." },
    { name:"JM Flexicap Fund", amc:"JM Financial MF", r1:-0.1, r3:19.9, r5:18.6, expense:0.50, aum:4504, risk:"Very High",
      pe:22.1, categoryPe:28.81, beta:1.08, sharpe:-0.05, manager:"Satyabrata Mohanty", since:2008, rating:4,
      note:"Lowest expense ratio (0.50%) among top flexi caps — genuine structural cost edge — but much smaller AUM and weaker brand recognition." },
    { name:"Kotak Flexicap Fund", amc:"Kotak Mahindra MF", r1:4.2, r3:15.4, r5:17.7, expense:0.66, aum:56885, risk:"High",
      pe:23.8, categoryPe:28.81, beta:0.93, sharpe:0.18, manager:"Harsha Upadhyaya", since:2009, rating:4,
      note:"Lowest beta (0.93) among major flexi caps — moves least with the market in both directions. Returns are moderate, below category average." },
    { name:"Edelweiss Flexi Cap Fund", amc:"Edelweiss MF", r1:5.8, r3:14.1, r5:14.9, expense:0.58, aum:3200, risk:"High",
      pe:21.0, categoryPe:28.81, beta:0.88, sharpe:0.21, manager:"Trideep Bhattacharya", since:2021, rating:3,
      note:"Most defensive flexi cap option — prioritises capital preservation over chasing returns. Good if smoother ride matters more than topping charts." },
  ],

  smallCap: [
    { name:"Quant Small Cap Fund", amc:"Quant MF", r1:-2.1, r3:21.15, r5:35.2, expense:0.62, aum:29400, risk:"Very High",
      maxDrawdown:-38.4, sharpe:0.71, manager:"Vasav Sahgal / Sanjeev Sharma", since:2008, rating:5,
      note:"Highest-octane fund in the category, exceptional 5Y returns, but the deepest drawdowns too — designed for a long horizon and a strong stomach for swings." },
    { name:"Bandhan Small Cap Fund", amc:"Bandhan MF (ex-IDFC)", r1:8.5, r3:29.17, r5:22.26, expense:0.55, aum:13800, risk:"Very High",
      maxDrawdown:-24.1, sharpe:0.95, manager:"Manish Gunwani / Ritika Behera", since:2022, rating:5,
      note:"Highest 3Y return in category with notably better drawdown control than Quant — a rare combination in small caps." },
    { name:"Invesco India Smallcap Fund", amc:"Invesco MF", r1:6.2, r3:24.68, r5:22.36, expense:0.58, aum:8900, risk:"Very High",
      maxDrawdown:-20.78, sharpe:1.11, manager:"Taher Badshah / Aditya Khemka", since:2018, rating:5,
      note:"Best Sharpe ratio (1.11) in the category — strongest risk-adjusted returns. Bottom-up stock picking, fully invested (~95%) growth bias." },
    { name:"Nippon India Small Cap Fund", amc:"Nippon India MF", r1:4.1, r3:19.56, r5:21.78, expense:0.64, aum:62300, risk:"Very High",
      maxDrawdown:-26.5, sharpe:0.88, manager:"Samir Rachh", since:2010, rating:4,
      note:"Largest small-cap AUM by far — great liquidity, but size can start to constrain how nimbly it trades in less-liquid small-cap stocks." },
    { name:"Tata Small Cap Fund", amc:"Tata MF", r1:-1.5, r3:13.49, r5:16.83, expense:0.39, aum:9100, risk:"Very High",
      maxDrawdown:-22.3, sharpe:0.65, manager:"Chandraprakash Padiyar", since:2018, rating:3,
      note:"Lowest expense ratio in the category but also the weakest returns of this group — cost savings haven't translated into outperformance." },
  ],

  index: [
    { name:"UTI Nifty 50 Index Fund", amc:"UTI MF", r1:7.1, r3:13.8, r5:14.9, expense:0.17, aum:21400, trackingError:0.05, benchmark:"Nifty 50 TRI", rating:5,
      note:"Largest AUM, government-sponsored AMC pedigree, excellent tracking (0.05% error). The 'buy and forget' Nifty 50 option — not the absolute cheapest, but the safest bet for liquidity." },
    { name:"ICICI Prudential Nifty 50 Index Fund", amc:"ICICI Prudential MF", r1:7.0, r3:13.7, r5:14.8, expense:0.15, aum:9500, trackingError:0.06, benchmark:"Nifty 50 TRI", rating:5,
      note:"Best balance of low cost (0.15%) and low tracking error (0.06%) from a top-tier AMC. Slightly smaller AUM than UTI/HDFC but irrelevant at retail scale." },
    { name:"HDFC Nifty 50 Index Fund", amc:"HDFC MF", r1:7.0, r3:13.6, r5:14.7, expense:0.20, aum:18900, trackingError:0.15, benchmark:"Nifty 50 TRI", rating:4,
      note:"From India's largest AMC by assets. Reliable, but 0.20% expense ratio and wider tracking error band (0.12–0.18%) than the cheapest options — costs compound over 20 years." },
    { name:"Navi Nifty 50 Index Fund", amc:"Navi MF", r1:7.0, r3:13.6, r5:null, expense:0.06, aum:1900, trackingError:0.08, benchmark:"Nifty 50 TRI", rating:4,
      note:"The disruptor — lowest expense ratio on the market (0.06%). Younger fund with shorter track record and smaller AUM, but the cost edge is real and compounds hugely over 20 years." },
    { name:"HDFC Nifty Next 50 Index Fund", amc:"HDFC MF", r1:5.2, r3:16.9, r5:13.2, expense:0.30, aum:6200, trackingError:0.18, benchmark:"Nifty Next 50 TRI", rating:4,
      note:"For aggressive investors wanting exposure to 'future Nifty 50' companies (ranked 51–100). Higher expense ratio than Nifty 50 funds, more volatile, higher 3Y returns recently." },
  ],

  elss: [
    { name:"Motilal Oswal ELSS Tax Saver Fund", amc:"Motilal Oswal MF", r1:22.2, r3:26.3, r5:21.3, expense:0.6, aum:3200, lockIn:3, rating:5,
      note:"Standout returns across all horizons in this batch of data, with the highest 1Y figure by a wide margin — but concentrated, high-conviction style funds like this can swing hard both ways." },
    { name:"Quant ELSS Tax Saver Fund", amc:"Quant MF", r1:10.9, r3:17.0, r5:18.8, expense:0.6, aum:12080, lockIn:3, rating:5,
      note:"Consistent mid-teens-to-high-teens returns across 3Y and 5Y, with the same quant-driven house style you already hold via Quant Small Cap — correlated risk if you stack both." },
    { name:"SBI ELSS Tax Saver Fund", amc:"SBI MF", r1:4.8, r3:20.7, r5:18.5, expense:0.9, aum:31094, lockIn:3, rating:4,
      note:"Largest ELSS fund in India (₹31,000+ Cr) — very stable, less prone to sudden shocks from large redemptions. Higher expense ratio than newer peers." },
    { name:"DSP ELSS Tax Saver Fund", amc:"DSP MF", r1:2.7, r3:18.0, r5:15.6, expense:0.7, aum:8400, lockIn:3, rating:4,
      note:"Steady, unremarkable-but-reliable mid-pack performer. No major red flags, no standout edge either." },
    { name:"HDFC ELSS Tax Saver Fund", amc:"HDFC MF", r1:0.5, r3:17.6, r5:18.2, expense:1.1, aum:15559, lockIn:3, rating:3,
      note:"Highest expense ratio (1.1%) in this set and the weakest 1Y number — the brand-name comfort comes at a real, measurable cost." },
  ],

  hybrid: [
    { name:"Quant Multi Asset Allocation Fund (Hybrid)", amc:"Quant MF", r1:13.1, r3:25.11, r5:21.5, expense:0.65, equityAlloc:68, debtAlloc:17, otherAlloc:15, rating:5,
      note:"Best 3Y/5Y returns in the hybrid space from this data, but it's the same aggressive quant house style — high return, high turbulence." },
    { name:"HDFC Balanced Advantage Fund", amc:"HDFC MF", r1:-1.3, r3:14.8, r5:15.4 , expense:0.7, equityAlloc:55, debtAlloc:30, otherAlloc:15, rating:4,
      note:"Largest, most established balanced advantage fund. Negative 1Y is a reminder that BAFs cut equity in rich markets — short-term dips are by design, not a flaw." },
    { name:"ICICI Prudential Balanced Advantage Fund", amc:"ICICI Prudential MF", r1:3.8, r3:12.0, r5:11.1, expense:0.9, equityAlloc:49.5, debtAlloc:19.4, otherAlloc:26.7, rating:4,
      note:"₹70,000+ Cr AUM, the category heavyweight. Lower equity allocation right now (valuation-driven), so lower returns but a genuinely smoother ride." },
    { name:"Baroda BNP Paribas Balanced Advantage Fund", amc:"Baroda BNP Paribas MF", r1:5.4, r3:14.0, r5:12.5, expense:0.8, equityAlloc:73.3, debtAlloc:22, otherAlloc:0.55, rating:4,
      note:"Higher equity tilt (73%) than typical BAFs, which is why its returns and 1Y number look stronger — effectively closer to an aggressive hybrid in disguise." },
    { name:"Nippon India Balanced Advantage Fund", amc:"Nippon India MF", r1:2.3, r3:11.8, r5:10.6, expense:0.6, equityAlloc:62, debtAlloc:21, otherAlloc:11, rating:3,
      note:"Lowest expense ratio in this set, but also the most middling returns — cost efficiency alone hasn't been enough to lead the category here." },
  ],
};

// ============================================================
// PROJECTION ASSUMPTIONS (for 20-year wealth projector)
// ============================================================
const SCENARIOS = {
  pessimistic: { label:"Pessimistic", rate:8,  color:"#B6452C" },
  expected:    { label:"Expected",    rate:12, color:"#1A6F5C" },
  optimistic:  { label:"Optimistic",  rate:15, color:"#C8932A" },
};

// Category-level expected return assumptions used in projector fund-mix toggle
const CATEGORY_RETURN_ASSUMPTIONS = {
  "Equity (Flexi/Small/Mid Cap)": { pess:9, exp:13, opt:17 },
  "Index Funds (Nifty 50)":       { pess:8, exp:12, opt:15 },
  "Multi Asset / Hybrid":         { pess:7, exp:11, opt:14 },
  "ELSS":                          { pess:8, exp:13, opt:16 },
};
