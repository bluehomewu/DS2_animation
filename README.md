# DS2 Animation

資料結構與演算法 動畫展示 — Data Structures & Algorithms Animation Demo

🔗 **線上展示 / Live Demo**: [https://bluehomewu.github.io/DS2_animation/](https://bluehomewu.github.io/DS2_animation/)

---

## 專案簡介 / Overview

本專案收錄課程各次作業的互動式演算法動畫，以 React + Babel 直接運行於瀏覽器（無需任何建置步驟），並透過 GitHub Actions 自動部署至 GitHub Pages。

This repository hosts interactive algorithm animations for each homework assignment. Animations are written in **JSX** and rendered in-browser using **React 18 + Babel Standalone** (no build step required). Deployment is fully automated via **GitHub Actions → GitHub Pages**.

---

## 目錄結構 / Repository Structure

```
DS2_animation/
├── index.html          # 首頁，自動偵測並列出所有作業動畫
├── HW1/
│   ├── heap-animation.jsx        # 堆積（Heap）操作動畫
│   └── all-predictions.jsx       # 預測結果展示動畫
├── scripts/
│   └── generate-html.py  # CI 腳本：為每個 .jsx 產生對應的 HTML 包裝頁面
└── .github/
    └── workflows/
        └── deploy.yml    # GitHub Actions 自動部署流程
```

> **注意**：`HW*/*.html` 為 CI 自動產生，**請勿手動提交**；只需提交 `.jsx` 原始檔。

---

## 作業列表 / Homework List

| 作業 | 動畫項目 | 說明 |
|------|----------|------|
| HW1  | Heap Animation | 二元堆積（Max-Heap / Min-Heap）的插入、刪除視覺化動畫 |
| HW1  | All Predictions | 演算法預測結果展示 |

*(列表依 JSX 原始檔的首次提交時間（上傳時間）由舊至新排序)*

---

## 技術架構 / Tech Stack

- **React 18** — UI 元件框架
- **Babel Standalone** — 瀏覽器端 JSX 即時轉譯
- **GitHub Pages** — 靜態網站託管
- **GitHub Actions** — CI/CD 自動部署

---

## 本地預覽 / Local Preview

由於使用瀏覽器端 Babel，可直接以本地 HTTP Server 預覽：

```bash
# Python 3
python -m http.server 8080
# 開啟瀏覽器 → http://localhost:8080
```

或使用任何靜態檔案伺服器（如 `npx serve .`）。

---

## 新增動畫 / Adding a New Animation

1. 在對應的 `HWX/` 目錄下建立 `your-animation.jsx`（React 元件預設匯出）。
2. `git add` 並提交該 `.jsx` 檔案，推送至 `master`。
3. GitHub Actions 會自動執行 `scripts/generate-html.py`，產生對應的 `your-animation.html` 並部署。
4. 首頁 `index.html` 會自動偵測並列出新動畫（依首次提交時間排序）。

---

## 授權 / License

MIT
