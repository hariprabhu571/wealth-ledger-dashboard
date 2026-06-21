<div align="center">

# 📒 Wealth Ledger

### A personal investment dashboard that thinks in decades, not days.

*Track your mutual funds and stocks, project 20 years of compounding across three market scenarios, and compare every major fund category in India — all in a single static HTML file with zero backend.*

[![Made with Vanilla JS](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](#)
[![Charts by Chart.js](https://img.shields.io/badge/Charts-Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white)](#)
[![No Backend](https://img.shields.io/badge/Backend-None%20needed-2E8B57?style=flat-square)](#)
[![Privacy First](https://img.shields.io/badge/Your%20Data-Stays%20on%20your%20device-C8932A?style=flat-square)](#-your-data-never-leaves-your-browser)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](#-license)

<br>

<img src="Images/screenshots/02-wealth-projector.png" alt="Wealth Ledger — 20-Year Wealth Projector" width="100%">

</div>

<br>

## Why this exists

Most "investment calculators" online are a single input box and a single optimistic number. They don't tell you what happens if markets disappoint. They don't compare a fund against its actual peers. And they definitely don't know what you already own.

**Wealth Ledger is different.** It's an 11-page dashboard built around one idea: *you should be able to see your real money, your real choices, and the real trade-offs — in one place, without sending your data anywhere.*

Add your holdings. Watch three honest scenarios — pessimistic, expected, optimistic — play out over 5 to 30 years. Compare every major mutual fund category in the Indian market side by side, on cost, consistency, and risk, not just headline returns. Then walk away with a plan, not just a graph.

<br>

## ✨ What's inside

<table>
<tr>
<td width="50%" valign="top">

### 📊 Your Portfolio, Editable
Add, edit, and delete mutual funds and stocks/ETFs directly in the dashboard — no spreadsheet, no upload. A live allocation chart and P&L summary update as you type.

### 📈 20-Year Wealth Projector
Set your monthly SIP, annual step-up, and time horizon. Watch **pessimistic (8%)**, **expected (12%)**, and **optimistic (15%)** scenarios unfold on one chart, with the exact rupee gap between what you invest and what compounding adds.

### 🧮 SIP & Return Calculator
Pick up to 5 funds from *any* category — Multi Asset, Flexi Cap, Small Cap, Index, ELSS, Hybrid — and overlay their real CAGR-based growth curves on a single chart.

</td>
<td width="50%" valign="top">

### 🔍 Six Full Category Deep-Dives
Every major fund in Multi Asset, Flexi Cap, Small Cap, Index, ELSS, and Hybrid/BAF categories, compared on returns, expense ratio, risk, AUM, and consistency — with a plain-English verdict for each category.

### 🎯 Dynamic Ownership Detection
Already hold a fund? The dashboard recognizes it inside every comparison table, highlights the row, and folds it into the verdict — automatically, with zero manual tagging.

### 🗺️ A Plan, Not Just a Dashboard
A suggested allocation built around what you actually hold, a month-by-month action plan, and a full glossary so every term — XIRR, Sharpe ratio, tracking error — is one click away from plain English.

</td>
</tr>
</table>

<br>

## 🖼️ A closer look

<details open>
<summary><b>Portfolio Snapshot — add, edit, and visualize your holdings</b></summary>
<br>
<img src="screenshots/01-portfolio-snapshot.png" alt="Portfolio snapshot with editable mutual funds and stocks table" width="100%">
</details>

<br>

<details>
<summary><b>SIP & Return Calculator — overlay any funds on one chart</b></summary>
<br>
<img src="Images/screenshots/03-sip-calculator.png" alt="SIP calculator with multi-fund comparison chart" width="100%">
</details>

<br>

<details>
<summary><b>Fund Category Deep-Dive — full comparison + verdict card</b></summary>
<br>
<img src="screenshots/04-fund-comparison.png" alt="Flexi Cap fund comparison table, charts, and verdict card" width="100%">
</details>

<br>

<details>
<summary><b>Recommended Portfolio — built around what you hold</b></summary>
<br>
<img src="screenshots/05-recommended-portfolio.png" alt="Recommended portfolio allocation chart and SIP split table" width="100%">
</details>

<br>

## 🗂️ The 11 pages

| # | Page | What it does |
|---|------|---------------|
| 01 | **Portfolio Snapshot** | Add, edit, delete your mutual funds & stocks/ETFs. Live totals and allocation chart. |
| 02 | **20-Year Wealth Projector** | Pessimistic / Expected / Optimistic scenarios on one chart, driven by sliders. |
| 03 | **SIP & Return Calculator** | Overlay up to 5 funds from any category using their real CAGR track record. |
| 04 | **Multi Asset Funds** | Full comparison + verdict — equity/debt/gold blend funds. |
| 05 | **Flexi Cap Funds** | Full comparison + verdict — unconstrained market-cap equity funds. |
| 06 | **Small Cap Funds** | Full comparison + verdict — high-growth, high-volatility picks. |
| 07 | **Index Funds** | Full comparison + verdict — passive, lowest-cost Nifty 50 / Next 50 trackers. |
| 08 | **ELSS (Tax Saving)** | Full comparison + verdict — Section 80C-eligible funds with 3-year lock-in. |
| 09 | **Hybrid / Balanced Advantage** | Full comparison + verdict — dynamic equity-debt allocators. |
| 10 | **Recommended Portfolio** | A suggested sleeve allocation, adapted to whatever you've actually added. |
| 11 | **Action Plan & Glossary** | This month's concrete next steps, plus a full plain-English glossary. |

<br>

## 🔐 Your data never leaves your browser

This is a **static site with no backend, no database, and no analytics.** That's a deliberate design choice, not a limitation:

- Everything you add on Page 01 is saved to your browser's `localStorage` — **on your device, in that one browser, only.**
- Nothing is sent to a server. There is no server.
- The code in this repository ships with **zero personal data** — every holding starts blank.
- Use the **Export JSON** button any time to download a backup of your holdings, and **Import JSON** to restore them — on this device, another device, or after clearing your browser.

> ⚠️ **One thing to watch:** if you export your holdings to a JSON file, that file *will* contain your real numbers. Don't commit it to a public repo. The included [`.gitignore`](.gitignore) already excludes `*holdings*.json` to help guard against this.

<br>

## 🚀 Getting started

No build step. No `npm install`. No server.

```bash
# 1. Clone the repo
git clone https://github.com/<your-username>/wealth-ledger.git
cd wealth-ledger

# 2. Open it
open index.html        # macOS
start index.html        # Windows
xdg-open index.html     # Linux
```

Or just double-click `index.html`. That's it — the dashboard runs entirely in your browser.

### Hosting it for free

Because it's fully static, you can deploy it anywhere in under a minute:

<table>
<tr>
<td align="center" width="33%">

**GitHub Pages**
<br>
Settings → Pages → Deploy from branch → `main` / root

</td>
<td align="center" width="33%">

**Netlify**
<br>
Drag the project folder onto [app.netlify.com/drop](https://app.netlify.com/drop)

</td>
<td align="center" width="33%">

**Vercel**
<br>
`vercel deploy` from the project root

</td>
</tr>
</table>

<br>

## 🧱 Built with

| | |
|---|---|
| **Structure** | Plain HTML5, no framework, no build tooling |
| **Logic** | Vanilla JavaScript (ES6+) |
| **Charts** | [Chart.js](https://www.chartjs.org/) v4.4.4 — bundled locally, zero CDN dependency |
| **Storage** | Browser `localStorage` + manual JSON export/import |
| **Fonts** | System font stack (Georgia / system-ui / monospace) — no external font requests |
| **Design** | Custom design system — ink navy, warm paper, teal & gold accents |

Everything required to run is in this repository. There are no external API calls, no CDN scripts, and no tracking of any kind — open `index.html` on a plane with no Wi-Fi and it works exactly the same.

<br>

## 📁 Project structure

```
wealth-ledger/
├── index.html          # Markup, design tokens, layout
├── app.js              # All page logic, charts, and interactivity
├── data.js             # Fund research data + your holdings schema (ships blank)
├── chart.umd.js         # Bundled Chart.js library (no CDN dependency)
├── screenshots/         # README preview images
├── .gitignore           # Keeps exported personal holdings out of git
├── LICENSE              # MIT
└── README.md
```

<br>

## 🛣️ Roadmap ideas

- [ ] Dark mode
- [ ] CSV import for bulk holdings
- [ ] PDF export of the full dashboard
- [ ] Live NAV refresh via a user-supplied API key (kept entirely client-side)
- [ ] Multi-currency support

Contributions and forks are welcome — open an issue if you'd like to take on one of these.

<br>

## ⚖️ Disclaimer

Wealth Ledger is a personal finance **visualization and education tool**, not a registered investment advisory product. Fund return data is gathered from public sources (Value Research, Tickertape, AMC factsheets) as of mid-2026 and will drift over time — always verify current NAVs and factsheets before investing. Nothing in this dashboard constitutes personalized financial advice from a SEBI-registered advisor. Mutual fund investments are subject to market risk.

<br>

## 📜 License

Released under the [MIT License](LICENSE) — use it, fork it, make it yours.

<br>

<div align="center">

*If this helped you think more clearly about your money, consider starring the repo ⭐*

</div>
