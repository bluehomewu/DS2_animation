import { useState, useEffect, useCallback, useRef } from "react";

// ─── Heap Logic ───
function buildMinHeapSteps(values) {
  const steps = [];
  const heap = [null];

  for (const val of values) {
    heap.push(val);
    const insertIdx = heap.length - 1;
    steps.push({
      heap: [...heap],
      highlight: [insertIdx],
      swapPair: null,
      message: `插入 ${val}，放到 index ${insertIdx}（陣列最尾端）`,
      phase: "insert",
    });

    let i = insertIdx;
    while (i > 1) {
      const p = Math.floor(i / 2);
      if (heap[i] < heap[p]) {
        steps.push({
          heap: [...heap],
          highlight: [i, p],
          swapPair: [i, p],
          message: `比較 heap[${i}]=${heap[i]} < heap[${p}]=${heap[p]}（父節點）→ 交換！`,
          phase: "compare",
        });
        [heap[i], heap[p]] = [heap[p], heap[i]];
        steps.push({
          heap: [...heap],
          highlight: [p],
          swapPair: null,
          message: `交換完成，${heap[p]} 上浮到 index ${p}`,
          phase: "swap",
        });
        i = p;
      } else {
        steps.push({
          heap: [...heap],
          highlight: [i, p],
          swapPair: null,
          message: `比較 heap[${i}]=${heap[i]} ≥ heap[${p}]=${heap[p]}（父節點）→ 合法，停止上浮`,
          phase: "ok",
        });
        break;
      }
    }
    if (i === 1 && insertIdx !== 1) {
      steps.push({
        heap: [...heap],
        highlight: [1],
        swapPair: null,
        message: `已到達樹根，上浮結束`,
        phase: "ok",
      });
    }
  }
  return steps;
}

function getLevel(i) {
  return Math.floor(Math.log2(i));
}

function buildMinMaxHeapSteps(values) {
  const steps = [];
  const heap = [null];

  for (const val of values) {
    heap.push(val);
    const insertIdx = heap.length - 1;
    const lvl = getLevel(insertIdx);
    const layerType = lvl % 2 === 0 ? "Min" : "Max";
    steps.push({
      heap: [...heap],
      highlight: [insertIdx],
      swapPair: null,
      message: `插入 ${val} 到 index ${insertIdx}（Level ${lvl}, ${layerType} 層）`,
      phase: "insert",
    });

    if (insertIdx === 1) continue;

    let i = insertIdx;
    const p = Math.floor(i / 2);
    const iLevel = getLevel(i);

    if (iLevel % 2 === 0) {
      // Min level
      if (heap[i] > heap[p]) {
        steps.push({
          heap: [...heap],
          highlight: [i, p],
          swapPair: [i, p],
          message: `Min 層的 ${heap[i]} > 父節點(Max層) ${heap[p]} → 走錯層，交換！`,
          phase: "compare",
        });
        [heap[i], heap[p]] = [heap[p], heap[i]];
        steps.push({
          heap: [...heap],
          highlight: [p],
          swapPair: null,
          message: `交換完成，走 Max 軌道繼續上浮`,
          phase: "swap",
        });
        i = p;
        // bubbleUpMax
        let gp = Math.floor(i / 4);
        while (gp > 0) {
          if (heap[i] > heap[gp]) {
            steps.push({
              heap: [...heap],
              highlight: [i, gp],
              swapPair: [i, gp],
              message: `Max 軌道：heap[${i}]=${heap[i]} > 祖父 heap[${gp}]=${heap[gp]} → 交換！`,
              phase: "compare",
            });
            [heap[i], heap[gp]] = [heap[gp], heap[i]];
            steps.push({
              heap: [...heap],
              highlight: [gp],
              swapPair: null,
              message: `交換完成，繼續往上比祖父`,
              phase: "swap",
            });
            i = gp;
            gp = Math.floor(i / 4);
          } else {
            steps.push({
              heap: [...heap],
              highlight: [i, gp],
              swapPair: null,
              message: `Max 軌道：heap[${i}]=${heap[i]} ≤ 祖父 heap[${gp}]=${heap[gp]} → 合法`,
              phase: "ok",
            });
            break;
          }
        }
      } else {
        steps.push({
          heap: [...heap],
          highlight: [i, p],
          swapPair: null,
          message: `Min 層的 ${heap[i]} ≤ 父節點(Max層) ${heap[p]} → 合理，走 Min 軌道`,
          phase: "ok",
        });
        // bubbleUpMin
        let gp = Math.floor(i / 4);
        while (gp > 0) {
          if (heap[i] < heap[gp]) {
            steps.push({
              heap: [...heap],
              highlight: [i, gp],
              swapPair: [i, gp],
              message: `Min 軌道：heap[${i}]=${heap[i]} < 祖父 heap[${gp}]=${heap[gp]} → 交換！`,
              phase: "compare",
            });
            [heap[i], heap[gp]] = [heap[gp], heap[i]];
            steps.push({
              heap: [...heap],
              highlight: [gp],
              swapPair: null,
              message: `交換完成，繼續往上比祖父`,
              phase: "swap",
            });
            i = gp;
            gp = Math.floor(i / 4);
          } else {
            steps.push({
              heap: [...heap],
              highlight: [i, gp],
              swapPair: null,
              message: `Min 軌道：heap[${i}]=${heap[i]} ≥ 祖父 heap[${gp}]=${heap[gp]} → 合法`,
              phase: "ok",
            });
            break;
          }
        }
      }
    } else {
      // Max level
      if (heap[i] < heap[p]) {
        steps.push({
          heap: [...heap],
          highlight: [i, p],
          swapPair: [i, p],
          message: `Max 層的 ${heap[i]} < 父節點(Min層) ${heap[p]} → 走錯層，交換！`,
          phase: "compare",
        });
        [heap[i], heap[p]] = [heap[p], heap[i]];
        steps.push({
          heap: [...heap],
          highlight: [p],
          swapPair: null,
          message: `交換完成，走 Min 軌道繼續上浮`,
          phase: "swap",
        });
        i = p;
        // bubbleUpMin
        let gp = Math.floor(i / 4);
        while (gp > 0) {
          if (heap[i] < heap[gp]) {
            steps.push({
              heap: [...heap],
              highlight: [i, gp],
              swapPair: [i, gp],
              message: `Min 軌道：heap[${i}]=${heap[i]} < 祖父 heap[${gp}]=${heap[gp]} → 交換！`,
              phase: "compare",
            });
            [heap[i], heap[gp]] = [heap[gp], heap[i]];
            steps.push({
              heap: [...heap],
              highlight: [gp],
              swapPair: null,
              message: `交換完成，繼續往上比祖父`,
              phase: "swap",
            });
            i = gp;
            gp = Math.floor(i / 4);
          } else {
            steps.push({
              heap: [...heap],
              highlight: [i, gp],
              swapPair: null,
              message: `Min 軌道：heap[${i}]=${heap[i]} ≥ 祖父 heap[${gp}]=${heap[gp]} → 合法`,
              phase: "ok",
            });
            break;
          }
        }
      } else {
        steps.push({
          heap: [...heap],
          highlight: [i, p],
          swapPair: null,
          message: `Max 層的 ${heap[i]} ≥ 父節點(Min層) ${heap[p]} → 合理，走 Max 軌道`,
          phase: "ok",
        });
        // bubbleUpMax
        let gp = Math.floor(i / 4);
        while (gp > 0) {
          if (heap[i] > heap[gp]) {
            steps.push({
              heap: [...heap],
              highlight: [i, gp],
              swapPair: [i, gp],
              message: `Max 軌道：heap[${i}]=${heap[i]} > 祖父 heap[${gp}]=${heap[gp]} → 交換！`,
              phase: "compare",
            });
            [heap[i], heap[gp]] = [heap[gp], heap[i]];
            steps.push({
              heap: [...heap],
              highlight: [gp],
              swapPair: null,
              message: `交換完成，繼續往上比祖父`,
              phase: "swap",
            });
            i = gp;
            gp = Math.floor(i / 4);
          } else {
            steps.push({
              heap: [...heap],
              highlight: [i, gp],
              swapPair: null,
              message: `Max 軌道：heap[${i}]=${heap[i]} ≤ 祖父 heap[${gp}]=${heap[gp]} → 合法`,
              phase: "ok",
            });
            break;
          }
        }
      }
    }
  }
  return steps;
}

// ─── Tree Drawing ───
function getNodePositions(heapSize) {
  const positions = {};
  if (heapSize <= 1) return positions;
  const n = heapSize - 1;
  const maxLevel = Math.floor(Math.log2(n));
  const totalWidth = 700;
  const levelHeight = 72;
  const topPad = 45;

  for (let i = 1; i <= n; i++) {
    const lvl = Math.floor(Math.log2(i));
    const posInLevel = i - Math.pow(2, lvl);
    const nodesInLevel = Math.pow(2, lvl);
    const spacing = totalWidth / (nodesInLevel + 1);
    positions[i] = {
      x: spacing * (posInLevel + 1),
      y: topPad + lvl * levelHeight,
    };
  }
  return positions;
}

function TreeView({ heap, highlight, swapPair, isMinMax }) {
  if (!heap || heap.length <= 1) {
    return (
      <div style={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center", color: "#8895a7" }}>
        尚未插入任何資料
      </div>
    );
  }

  const positions = getNodePositions(heap.length);
  const n = heap.length - 1;
  const maxLevel = Math.floor(Math.log2(n));
  const svgHeight = 45 + maxLevel * 72 + 50;

  const highlightSet = new Set(highlight || []);
  const swapSet = new Set(swapPair || []);

  return (
    <svg width="100%" viewBox={`0 0 700 ${svgHeight}`} style={{ display: "block" }}>
      {/* Level labels for min-max */}
      {isMinMax && Array.from({ length: maxLevel + 1 }, (_, lvl) => {
        const isMin = lvl % 2 === 0;
        return (
          <g key={`lvl-${lvl}`}>
            <text
              x={10}
              y={45 + lvl * 72 + 5}
              fontSize="11"
              fontWeight="600"
              fill={isMin ? "#2563eb" : "#dc2626"}
              fontFamily="'IBM Plex Mono', monospace"
            >
              L{lvl} {isMin ? "Min" : "Max"}
            </text>
          </g>
        );
      })}

      {/* Edges */}
      {Array.from({ length: n }, (_, idx) => {
        const i = idx + 1;
        const left = 2 * i;
        const right = 2 * i + 1;
        const edges = [];
        if (left <= n && positions[i] && positions[left]) {
          edges.push(
            <line
              key={`e-${i}-${left}`}
              x1={positions[i].x}
              y1={positions[i].y}
              x2={positions[left].x}
              y2={positions[left].y}
              stroke="#cbd5e1"
              strokeWidth="2"
            />
          );
        }
        if (right <= n && positions[i] && positions[right]) {
          edges.push(
            <line
              key={`e-${i}-${right}`}
              x1={positions[i].x}
              y1={positions[i].y}
              x2={positions[right].x}
              y2={positions[right].y}
              stroke="#cbd5e1"
              strokeWidth="2"
            />
          );
        }
        return edges;
      })}

      {/* Swap arrow */}
      {swapPair && swapPair.length === 2 && positions[swapPair[0]] && positions[swapPair[1]] && (
        <g>
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
            </marker>
          </defs>
          <line
            x1={positions[swapPair[0]].x}
            y1={positions[swapPair[0]].y}
            x2={positions[swapPair[1]].x}
            y2={positions[swapPair[1]].y}
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeDasharray="6 3"
            markerEnd="url(#arrowhead)"
          />
        </g>
      )}

      {/* Nodes */}
      {Array.from({ length: n }, (_, idx) => {
        const i = idx + 1;
        if (!positions[i]) return null;
        const { x, y } = positions[i];
        const isHighlighted = highlightSet.has(i);
        const isSwapping = swapSet.has(i);
        const lvl = Math.floor(Math.log2(i));

        let fillColor = "#1e293b";
        let strokeColor = "#334155";
        let textColor = "#f1f5f9";

        if (isSwapping) {
          fillColor = "#f59e0b";
          strokeColor = "#d97706";
          textColor = "#1c1917";
        } else if (isHighlighted) {
          fillColor = "#3b82f6";
          strokeColor = "#2563eb";
          textColor = "#fff";
        } else if (isMinMax) {
          if (lvl % 2 === 0) {
            fillColor = "#1e3a5f";
            strokeColor = "#2563eb";
          } else {
            fillColor = "#5f1e1e";
            strokeColor = "#dc2626";
          }
        }

        return (
          <g key={`n-${i}`}>
            <circle cx={x} cy={y} r={22} fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
            <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="700" fill={textColor} fontFamily="'IBM Plex Mono', monospace">
              {heap[i]}
            </text>
            <text x={x} y={y + 35} textAnchor="middle" fontSize="10" fill="#64748b" fontFamily="'IBM Plex Mono', monospace">
              [{i}]
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Array View ───
function ArrayView({ heap, highlight, swapPair }) {
  if (!heap || heap.length <= 1) return null;
  const highlightSet = new Set(highlight || []);
  const swapSet = new Set(swapPair || []);

  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "end", padding: "0 4px" }}>
      {heap.slice(1).map((val, idx) => {
        const i = idx + 1;
        const isH = highlightSet.has(i);
        const isS = swapSet.has(i);
        let bg = "#1e293b";
        let border = "#334155";
        let color = "#e2e8f0";
        if (isS) { bg = "#f59e0b"; border = "#d97706"; color = "#1c1917"; }
        else if (isH) { bg = "#3b82f6"; border = "#2563eb"; color = "#fff"; }
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <div style={{
              width: 40, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 6, background: bg, border: `2px solid ${border}`, color, fontSize: 13,
              fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace",
              transition: "all 0.3s ease",
            }}>
              {val}
            </div>
            <span style={{ fontSize: 10, color: "#64748b", fontFamily: "'IBM Plex Mono', monospace" }}>[{i}]</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main App ───
const DEFAULT_VALUES = [30, 20, 50, 10, 40, 35, 5, 25];

export default function HeapAnimation() {
  const [tab, setTab] = useState("min");
  const [inputText, setInputText] = useState(DEFAULT_VALUES.join(", "));
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const timerRef = useRef(null);

  const generate = useCallback((t, text) => {
    const vals = text.split(/[,\s]+/).map(Number).filter(n => !isNaN(n) && n !== 0);
    if (vals.length === 0) return;
    const s = t === "min" ? buildMinHeapSteps(vals) : buildMinMaxHeapSteps(vals);
    setSteps(s);
    setStepIdx(0);
    setPlaying(false);
  }, []);

  useEffect(() => {
    generate(tab, inputText);
  }, []);

  useEffect(() => {
    if (playing && stepIdx < steps.length - 1) {
      timerRef.current = setTimeout(() => setStepIdx(i => i + 1), speed);
      return () => clearTimeout(timerRef.current);
    } else if (stepIdx >= steps.length - 1) {
      setPlaying(false);
    }
  }, [playing, stepIdx, steps.length, speed]);

  const current = steps[stepIdx] || { heap: [null], highlight: [], swapPair: null, message: "", phase: "" };

  const phaseColors = {
    insert: { bg: "#1e3a5f", border: "#2563eb", text: "#93c5fd" },
    compare: { bg: "#5f4b1e", border: "#f59e0b", text: "#fcd34d" },
    swap: { bg: "#5f3a1e", border: "#f97316", text: "#fdba74" },
    ok: { bg: "#1e4a3a", border: "#10b981", text: "#6ee7b7" },
  };
  const pc = phaseColors[current.phase] || phaseColors.insert;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f172a",
      color: "#e2e8f0",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      padding: "24px 16px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap" rel="stylesheet" />

      {/* Title */}
      <h1 style={{
        textAlign: "center",
        fontSize: 22,
        fontWeight: 800,
        margin: "0 0 20px",
        letterSpacing: "-0.5px",
        fontFamily: "'IBM Plex Mono', monospace",
      }}>
        <span style={{ color: "#60a5fa" }}>Heap</span> 建構動畫演示
      </h1>

      {/* Tab switch */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
        {[
          { key: "min", label: "任務一：Min Heap" },
          { key: "minmax", label: "任務二：Min-Max Heap" },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); generate(t.key, inputText); }}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: `2px solid ${tab === t.key ? "#3b82f6" : "#334155"}`,
              background: tab === t.key ? "#1e3a5f" : "#1e293b",
              color: tab === t.key ? "#93c5fd" : "#94a3b8",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{
        maxWidth: 600,
        margin: "0 auto 16px",
        display: "flex",
        gap: 8,
      }}>
        <input
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="輸入數字（逗號分隔）"
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 8,
            border: "2px solid #334155",
            background: "#1e293b",
            color: "#e2e8f0",
            fontSize: 14,
            fontFamily: "'IBM Plex Mono', monospace",
            outline: "none",
          }}
          onKeyDown={e => { if (e.key === "Enter") generate(tab, inputText); }}
        />
        <button
          onClick={() => generate(tab, inputText)}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "2px solid #3b82f6",
            background: "#2563eb",
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          建構
        </button>
      </div>

      {/* Tree */}
      <div style={{
        maxWidth: 720,
        margin: "0 auto",
        background: "#141c2e",
        borderRadius: 12,
        border: "1px solid #1e293b",
        padding: "8px 0 0",
        overflow: "hidden",
      }}>
        {/* Tree title */}
        <div style={{
          textAlign: "center", fontSize: 12, color: "#64748b", padding: "4px 0 2px",
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          {tab === "min" ? "Min Heap 樹狀結構" : "Min-Max Heap 樹狀結構"}
          {tab === "minmax" && (
            <span style={{ marginLeft: 12 }}>
              <span style={{ color: "#60a5fa" }}>■</span> Min 層　
              <span style={{ color: "#f87171" }}>■</span> Max 層
            </span>
          )}
        </div>

        <TreeView
          heap={current.heap}
          highlight={current.highlight}
          swapPair={current.swapPair}
          isMinMax={tab === "minmax"}
        />

        {/* Array view */}
        <div style={{ padding: "8px 16px 12px" }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" }}>
            陣列表示：
          </div>
          <ArrayView heap={current.heap} highlight={current.highlight} swapPair={current.swapPair} />
        </div>
      </div>

      {/* Message bar */}
      <div style={{
        maxWidth: 720,
        margin: "12px auto",
        padding: "12px 16px",
        borderRadius: 10,
        background: pc.bg,
        border: `2px solid ${pc.border}`,
        color: pc.text,
        fontSize: 14,
        fontWeight: 600,
        fontFamily: "'IBM Plex Mono', monospace",
        minHeight: 44,
        display: "flex",
        alignItems: "center",
      }}>
        <span style={{
          display: "inline-block",
          width: 8, height: 8,
          borderRadius: "50%",
          background: pc.text,
          marginRight: 10,
          flexShrink: 0,
        }} />
        {current.message || "準備就緒"}
      </div>

      {/* Controls */}
      <div style={{
        maxWidth: 720,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        flexWrap: "wrap",
      }}>
        <button
          onClick={() => { setStepIdx(0); setPlaying(false); }}
          disabled={stepIdx === 0}
          style={btnStyle(stepIdx === 0)}
        >
          ⏮ 重置
        </button>
        <button
          onClick={() => setStepIdx(i => Math.max(0, i - 1))}
          disabled={stepIdx === 0}
          style={btnStyle(stepIdx === 0)}
        >
          ◀ 上一步
        </button>
        <button
          onClick={() => setPlaying(p => !p)}
          style={{
            ...btnStyle(false),
            background: playing ? "#dc2626" : "#16a34a",
            borderColor: playing ? "#f87171" : "#4ade80",
            minWidth: 80,
          }}
        >
          {playing ? "⏸ 暫停" : "▶ 播放"}
        </button>
        <button
          onClick={() => setStepIdx(i => Math.min(steps.length - 1, i + 1))}
          disabled={stepIdx >= steps.length - 1}
          style={btnStyle(stepIdx >= steps.length - 1)}
        >
          下一步 ▶
        </button>
        <button
          onClick={() => { setStepIdx(steps.length - 1); setPlaying(false); }}
          disabled={stepIdx >= steps.length - 1}
          style={btnStyle(stepIdx >= steps.length - 1)}
        >
          跳到結尾 ⏭
        </button>
      </div>

      {/* Speed + Progress */}
      <div style={{
        maxWidth: 720,
        margin: "12px auto 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 12,
        color: "#64748b",
        fontFamily: "'IBM Plex Mono', monospace",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>速度：</span>
          <input
            type="range"
            min={200}
            max={2000}
            step={100}
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
            style={{ width: 100, accentColor: "#3b82f6" }}
          />
          <span>{speed}ms</span>
        </div>
        <div>
          步驟 {stepIdx + 1} / {steps.length}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        maxWidth: 720,
        margin: "8px auto 0",
        height: 4,
        borderRadius: 2,
        background: "#1e293b",
        overflow: "hidden",
      }}>
        <div style={{
          width: `${steps.length > 1 ? (stepIdx / (steps.length - 1)) * 100 : 0}%`,
          height: "100%",
          background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
          borderRadius: 2,
          transition: "width 0.3s ease",
        }} />
      </div>
    </div>
  );
}

function btnStyle(disabled) {
  return {
    padding: "8px 14px",
    borderRadius: 8,
    border: `2px solid ${disabled ? "#1e293b" : "#334155"}`,
    background: disabled ? "#0f172a" : "#1e293b",
    color: disabled ? "#475569" : "#e2e8f0",
    fontSize: 13,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'IBM Plex Mono', monospace",
    transition: "all 0.2s",
  };
}
