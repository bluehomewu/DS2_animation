import { useState, useEffect, useCallback, useRef } from "react";

const FONT = "'JetBrains Mono', 'Fira Code', monospace";
const FONT_URL = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&display=swap";

// ══════════════════════════════════════════
//  共用元件
// ══════════════════════════════════════════

function getPos(heapLen, w = 700) {
  const pos = {};
  const n = heapLen - 1;
  if (n < 1) return pos;
  for (let i = 1; i <= n; i++) {
    const lvl = Math.floor(Math.log2(i));
    const inLvl = i - (1 << lvl);
    const cnt = 1 << lvl;
    const sp = w / (cnt + 1);
    pos[i] = { x: sp * (inLvl + 1), y: 42 + lvl * 68 };
  }
  return pos;
}

function HeapTree({ heap, hl = [], swap = null, nodeColor, levelLabels, specialNodes = [] }) {
  if (!heap || heap.length <= 1)
    return (
      <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontFamily: FONT, fontSize: 13 }}>
        Heap 為空
      </div>
    );
  const pos = getPos(heap.length);
  const n = heap.length - 1;
  const maxLvl = Math.floor(Math.log2(n));
  const h = 42 + maxLvl * 68 + 52;
  const hlSet = new Set(hl);
  const swSet = new Set(swap || []);
  const spSet = new Set(specialNodes);

  return (
    <svg width="100%" viewBox={`0 0 700 ${h}`} style={{ display: "block" }}>
      {levelLabels &&
        Array.from({ length: maxLvl + 1 }, (_, lvl) => {
          const label = typeof levelLabels === "function" ? levelLabels(lvl) : null;
          if (!label) return null;
          return (
            <text key={`ll${lvl}`} x={10} y={42 + lvl * 68 + 5} fontSize="10" fontWeight="700" fill={label.color} fontFamily={FONT}>
              {label.text}
            </text>
          );
        })}
      {Array.from({ length: n }, (_, i) => {
        const idx = i + 1;
        return [2 * idx, 2 * idx + 1]
          .filter((c) => c <= n && pos[idx] && pos[c])
          .map((c) => <line key={`e${idx}-${c}`} x1={pos[idx].x} y1={pos[idx].y} x2={pos[c].x} y2={pos[c].y} stroke="#333" strokeWidth="2" />);
      })}
      {swap && swap.length === 2 && pos[swap[0]] && pos[swap[1]] && (
        <line x1={pos[swap[0]].x} y1={pos[swap[0]].y} x2={pos[swap[1]].x} y2={pos[swap[1]].y} stroke="#facc15" strokeWidth="2.5" strokeDasharray="6 4" />
      )}
      {Array.from({ length: n }, (_, i) => {
        const idx = i + 1;
        if (!pos[idx]) return null;
        const isSw = swSet.has(idx);
        const isSp = spSet.has(idx);
        const isHl = hlSet.has(idx);
        let fill = "#151525",
          stroke = "#3a3a50",
          txt = "#888";
        if (isSp) {
          fill = "#fbbf24"; stroke = "#f59e0b"; txt = "#1c1917";
        } else if (isSw) {
          fill = "#facc15"; stroke = "#eab308"; txt = "#1c1917";
        } else if (isHl) {
          const c = nodeColor ? nodeColor(idx) : { fill: "#0ea5e9", stroke: "#0284c7", txt: "#fff" };
          fill = c.fill; stroke = c.stroke; txt = c.txt;
        }
        return (
          <g key={`n${idx}`}>
            {isSp && (
              <circle cx={pos[idx].x} cy={pos[idx].y} r={28} fill="none" stroke="#fbbf24" strokeWidth="3" strokeDasharray="5 3" opacity={0.7}>
                <animate attributeName="r" values="28;32;28" dur="1s" repeatCount="indefinite" />
              </circle>
            )}
            <circle cx={pos[idx].x} cy={pos[idx].y} r={21} fill={fill} stroke={stroke} strokeWidth="2.5" />
            <text x={pos[idx].x} y={pos[idx].y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="700" fill={txt} fontFamily={FONT}>
              {heap[idx]}
            </text>
            <text x={pos[idx].x} y={pos[idx].y + 34} textAnchor="middle" fontSize="9" fill="#555" fontFamily={FONT}>
              [{idx}]
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ArrView({ heap, hl = [], swap = null }) {
  if (!heap || heap.length <= 1) return null;
  const hlSet = new Set(hl);
  const swSet = new Set(swap || []);
  return (
    <div style={{ display: "flex", gap: 3, flexWrap: "wrap", padding: "0 4px" }}>
      {heap.slice(1).map((v, i) => {
        const idx = i + 1;
        let bg = "#151525", border = "#2a2a3e", c = "#999";
        if (swSet.has(idx)) { bg = "#facc15"; border = "#eab308"; c = "#1c1917"; }
        else if (hlSet.has(idx)) { bg = "#0ea5e9"; border = "#0284c7"; c = "#fff"; }
        return (
          <div key={idx} style={{ textAlign: "center" }}>
            <div style={{ width: 36, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 5, background: bg, border: `2px solid ${border}`, color: c, fontSize: 12, fontWeight: 700, fontFamily: FONT }}>{v}</div>
            <div style={{ fontSize: 9, color: "#444", fontFamily: FONT }}>[{idx}]</div>
          </div>
        );
      })}
    </div>
  );
}

function Controls({ si, total, playing, setPlaying, setSi, speed, setSpeed, accentColor = "#0ea5e9" }) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", gap: 7, flexWrap: "wrap", marginTop: 8 }}>
        <Btn onClick={() => { setSi(0); setPlaying(false); }} d={si === 0}>⏮</Btn>
        <Btn onClick={() => setSi((i) => Math.max(0, i - 1))} d={si === 0}>◀</Btn>
        <Btn onClick={() => setPlaying((p) => !p)} style={{ background: playing ? "#dc2626" : "#16a34a", borderColor: playing ? "#f87171" : "#4ade80" }}>
          {playing ? "⏸ 暫停" : "▶ 播放"}
        </Btn>
        <Btn onClick={() => setSi((i) => Math.min(total - 1, i + 1))} d={si >= total - 1}>▶</Btn>
        <Btn onClick={() => { setSi(total - 1); setPlaying(false); }} d={si >= total - 1}>⏭</Btn>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#555", fontFamily: FONT, marginTop: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          速度：
          <input type="range" min={150} max={2000} step={50} value={speed} onChange={(e) => setSpeed(+e.target.value)} style={{ width: 80, accentColor }} />
          {speed}ms
        </div>
        <div>
          {si + 1}/{total}
        </div>
      </div>
    </>
  );
}

function MsgBar({ msg, color }) {
  return (
    <div style={{ padding: "10px 14px", borderRadius: 8, background: color + "15", border: `2px solid ${color}44`, color, fontSize: 12, fontWeight: 600, fontFamily: FONT, minHeight: 38, display: "flex", alignItems: "center", marginTop: 8 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, marginRight: 10, flexShrink: 0 }} />
      {msg || "準備就緒"}
    </div>
  );
}

function CodeBlock({ children }) {
  return (
    <div style={{ background: "#0c0c1c", borderRadius: 7, padding: "8px 12px", border: "1px solid #1e1e30", fontFamily: FONT, fontSize: 11, lineHeight: 1.7, marginBottom: 10, overflowX: "auto" }}>
      {children}
    </div>
  );
}

function InputBar({ input, setInput, onGo, btnLabel = "建構", btnColor = "#0ea5e9", btnText = "#042f2e" }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
      <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onGo()}
        style={{ flex: 1, padding: "8px 12px", borderRadius: 7, border: "2px solid #222", background: "#111", color: "#e0e0e0", fontSize: 13, fontFamily: FONT, outline: "none" }}
        placeholder="輸入數字，逗號分隔" />
      <button onClick={onGo} style={{ padding: "8px 16px", borderRadius: 7, border: "none", background: btnColor, color: btnText, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
        {btnLabel}
      </button>
    </div>
  );
}

function Btn({ children, d, onClick, style = {} }) {
  return (
    <button onClick={onClick} disabled={d} style={{ padding: "6px 12px", borderRadius: 6, border: `2px solid ${d ? "#111" : "#282838"}`, background: d ? "#0a0a14" : "#151525", color: d ? "#333" : "#ccc", fontSize: 12, fontWeight: 600, cursor: d ? "not-allowed" : "pointer", fontFamily: FONT, transition: "all 0.15s", ...style }}>
      {children}
    </button>
  );
}

function usePlayer(genFn, deps, defaultSpeed = 700) {
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(defaultSpeed);
  const timer = useRef(null);

  const run = useCallback((...args) => {
    const s = genFn(...args);
    setSteps(s);
    setSi(0);
    setPlaying(false);
  }, deps);

  useEffect(() => {
    if (playing && si < steps.length - 1) {
      timer.current = setTimeout(() => setSi((i) => i + 1), speed);
      return () => clearTimeout(timer.current);
    } else if (si >= steps.length - 1) setPlaying(false);
  }, [playing, si, steps.length, speed]);

  return { steps, si, setSi, playing, setPlaying, speed, setSpeed, run, cur: steps[si] || null };
}

// ══════════════════════════════════════════
//  Heap 建構工具
// ══════════════════════════════════════════

function buildMinHeap(values) {
  const heap = [null];
  for (const val of values) {
    heap.push(val);
    let i = heap.length - 1;
    while (i > 1) { const p = Math.floor(i / 2); if (heap[i] < heap[p]) { [heap[i], heap[p]] = [heap[p], heap[i]]; i = p; } else break; }
  }
  return heap;
}

function buildMinMaxHeap(values) {
  const heap = [null];
  const gl = (i) => Math.floor(Math.log2(i));
  for (const val of values) {
    heap.push(val);
    let i = heap.length - 1;
    if (i === 1) continue;
    const p = Math.floor(i / 2);
    if (gl(i) % 2 === 0) {
      if (heap[i] > heap[p]) { [heap[i], heap[p]] = [heap[p], heap[i]]; i = p; let g = Math.floor(i / 4); while (g > 0) { if (heap[i] > heap[g]) { [heap[i], heap[g]] = [heap[g], heap[i]]; i = g; g = Math.floor(i / 4); } else break; } }
      else { let g = Math.floor(i / 4); while (g > 0) { if (heap[i] < heap[g]) { [heap[i], heap[g]] = [heap[g], heap[i]]; i = g; g = Math.floor(i / 4); } else break; } }
    } else {
      if (heap[i] < heap[p]) { [heap[i], heap[p]] = [heap[p], heap[i]]; i = p; let g = Math.floor(i / 4); while (g > 0) { if (heap[i] < heap[g]) { [heap[i], heap[g]] = [heap[g], heap[i]]; i = g; g = Math.floor(i / 4); } else break; } }
      else { let g = Math.floor(i / 4); while (g > 0) { if (heap[i] > heap[g]) { [heap[i], heap[g]] = [heap[g], heap[i]]; i = g; g = Math.floor(i / 4); } else break; } }
    }
  }
  return heap;
}

function parseInput(txt) {
  return txt.split(/[,\s]+/).map(Number).filter((n) => !isNaN(n) && n !== 0);
}

const DEFAULT_INPUT = "30, 20, 50, 10, 40, 35, 5, 25";

// ══════════════════════════════════════════
//  預測一：Max Heap
// ══════════════════════════════════════════

function genP1Steps(values, mode) {
  const steps = [];
  const heap = [null];
  for (const val of values) {
    heap.push(val);
    const idx = heap.length - 1;
    steps.push({ heap: [...heap], hl: [idx], swap: null, msg: `插入 ${val} → index ${idx}`, phase: "insert" });
    let i = idx;
    while (i > 1) {
      const p = Math.floor(i / 2);
      const cond = mode === "max" ? heap[i] > heap[p] : heap[i] < heap[p];
      const sym = mode === "max" ? ">" : "<";
      if (cond) {
        steps.push({ heap: [...heap], hl: [i, p], swap: [i, p], msg: `heap[${i}]=${heap[i]} ${sym} heap[${p}]=${heap[p]} → 交換上浮`, phase: "swap" });
        [heap[i], heap[p]] = [heap[p], heap[i]];
        steps.push({ heap: [...heap], hl: [p], swap: null, msg: `${heap[p]} 上浮到 index ${p}`, phase: "done" });
        i = p;
      } else {
        steps.push({ heap: [...heap], hl: [i, p], swap: null, msg: `heap[${i}]=${heap[i]} — 合法，停止`, phase: "ok" });
        break;
      }
    }
  }
  return steps;
}

function Pred1() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [mode, setMode] = useState("max");
  const { steps, si, setSi, playing, setPlaying, speed, setSpeed, run, cur } = usePlayer((v, m) => genP1Steps(v, m), [], 600);
  useEffect(() => { const v = parseInput(input); if (v.length) run(v, mode); }, []);
  const go = (m) => { const v = parseInput(input); if (v.length) { setMode(m); run(v, m); } };
  const s = cur || { heap: [null], hl: [], swap: null, msg: "", phase: "" };
  const pc = { insert: "#3b82f6", swap: "#facc15", done: "#f97316", ok: "#22c55e" };

  return (
    <div>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 10, fontFamily: FONT }}>核心：siftUp 比較符號 — Max 用 &gt;，Min 用 &lt;，只改一個字元</p>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {[{ k: "max", l: "Max Heap（改後）", c: "#ef4444" }, { k: "min", l: "Min Heap（原版）", c: "#3b82f6" }].map((t) => (
          <button key={t.k} onClick={() => go(t.k)} style={{ padding: "7px 14px", borderRadius: 7, border: `2px solid ${mode === t.k ? t.c : "#282838"}`, background: mode === t.k ? t.c + "20" : "#151525", color: mode === t.k ? t.c : "#666", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>{t.l}</button>
        ))}
      </div>
      <CodeBlock>
        <div style={{ color: "#888" }}>// siftUp 核心比較：</div>
        {mode === "max"
          ? <div><span style={{ color: "#ef4444", fontWeight: 700 }}>if (heap[i] &gt; heap[parent])</span> <span style={{ color: "#555" }}>// 比爸爸大就上浮</span></div>
          : <div><span style={{ color: "#3b82f6", fontWeight: 700 }}>if (heap[i] &lt; heap[parent])</span> <span style={{ color: "#555" }}>// 比爸爸小就上浮</span></div>}
      </CodeBlock>
      <InputBar input={input} setInput={setInput} onGo={() => go(mode)} btnColor={mode === "max" ? "#ef4444" : "#3b82f6"} />
      <div style={{ background: "#0e0e1e", borderRadius: 10, border: "1px solid #1e1e30", padding: "6px 0 8px" }}>
        <HeapTree heap={s.heap} hl={s.hl} swap={s.swap} nodeColor={() => ({ fill: mode === "max" ? "#ef4444" : "#0ea5e9", stroke: mode === "max" ? "#dc2626" : "#0284c7", txt: "#fff" })} />
        <div style={{ padding: "4px 12px 8px" }}><ArrView heap={s.heap} hl={s.hl} swap={s.swap} /></div>
      </div>
      <MsgBar msg={s.msg} color={pc[s.phase] || "#3b82f6"} />
      <Controls si={si} total={steps.length} playing={playing} setPlaying={setPlaying} setSi={setSi} speed={speed} setSpeed={setSpeed} accentColor="#ef4444" />
    </div>
  );
}

// ══════════════════════════════════════════
//  預測二：DeleteMin + SiftDown
// ══════════════════════════════════════════

function genP2Steps(values) {
  const heap = buildMinHeap(values);
  const steps = [];
  const sorted = [];
  steps.push({ heap: [...heap], hl: [1], swap: null, sorted: [...sorted], msg: `Min Heap 已建好，root=${heap[1]}`, phase: "info" });
  while (heap.length > 2) {
    const mv = heap[1], li = heap.length - 1;
    steps.push({ heap: [...heap], hl: [1, li], swap: [li, 1], sorted: [...sorted], msg: `取出 root=${mv}，把 heap[${li}]=${heap[li]} 搬到 root`, phase: "move" });
    heap[1] = heap[li]; heap.pop();
    steps.push({ heap: [...heap], hl: [1], swap: null, sorted: [...sorted], msg: `開始 siftDown`, phase: "sift" });
    let i = 1, n = heap.length - 1;
    while (2 * i <= n) {
      let c = 2 * i;
      if (c + 1 <= n && heap[c + 1] < heap[c]) c++;
      if (heap[i] > heap[c]) {
        steps.push({ heap: [...heap], hl: [i, c], swap: [i, c], sorted: [...sorted], msg: `heap[${i}]=${heap[i]} > heap[${c}]=${heap[c]} → 交換下沉`, phase: "swap" });
        [heap[i], heap[c]] = [heap[c], heap[i]];
        steps.push({ heap: [...heap], hl: [c], swap: null, sorted: [...sorted], msg: `下沉到 index ${c}`, phase: "done" });
        i = c;
      } else {
        steps.push({ heap: [...heap], hl: [i], swap: null, sorted: [...sorted], msg: `合法，siftDown 結束`, phase: "ok" });
        break;
      }
    }
    sorted.push(mv);
    steps.push({ heap: [...heap], hl: [], swap: null, sorted: [...sorted], msg: `已取出 ${mv}，排序中：[${sorted.join(", ")}]`, phase: "result" });
  }
  if (heap.length === 2) { sorted.push(heap[1]); steps.push({ heap: [null], hl: [], swap: null, sorted: [...sorted], msg: `全部取出，完成`, phase: "result" }); }
  return steps;
}

function Pred2() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const { steps, si, setSi, playing, setPlaying, speed, setSpeed, run, cur } = usePlayer((v) => genP2Steps(v), [], 700);
  useEffect(() => { const v = parseInput(input); if (v.length) run(v); }, []);
  const s = cur || { heap: [null], hl: [], swap: null, sorted: [], msg: "", phase: "" };
  const pc = { info: "#0ea5e9", move: "#f59e0b", sift: "#a855f7", swap: "#22c55e", done: "#22c55e", ok: "#22c55e", result: "#0ea5e9" };

  return (
    <div>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 10, fontFamily: FONT }}>搬最後節點到 root → 跟較小孩子交換 → 重複直到清空</p>
      <CodeBlock>
        <div style={{ color: "#22c55e" }}>Node deleteMin() {"{"}</div>
        <div style={{ color: "#ccc", paddingLeft: 14 }}>Node min = heap[1];</div>
        <div style={{ color: "#f59e0b", paddingLeft: 14 }}>heap[1] = heap.back(); heap.pop_back();</div>
        <div style={{ color: "#0ea5e9", paddingLeft: 14 }}>siftDown(1); <span style={{ color: "#555" }}>// 下沉到合法位置</span></div>
        <div style={{ color: "#ccc", paddingLeft: 14 }}>return min;</div>
        <div style={{ color: "#22c55e" }}>{"}"}</div>
      </CodeBlock>
      <InputBar input={input} setInput={setInput} onGo={() => { const v = parseInput(input); if (v.length) run(v); }} btnColor="#22c55e" btnText="#052e16" btnLabel="建構＆刪除" />
      <div style={{ background: "#0e0e1e", borderRadius: 10, border: "1px solid #1e1e30", padding: "6px 0 8px" }}>
        <HeapTree heap={s.heap} hl={s.hl} swap={s.swap} />
      </div>
      {s.sorted && s.sorted.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontFamily: FONT, fontSize: 12 }}>
          <span style={{ color: "#22c55e", fontWeight: 700 }}>已取出：</span>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {s.sorted.map((v, i) => (
              <div key={i} style={{ width: 34, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 5, background: "#052e16", border: "1px solid #22c55e44", color: "#22c55e", fontSize: 12, fontWeight: 700, fontFamily: FONT }}>{v}</div>
            ))}
          </div>
        </div>
      )}
      <MsgBar msg={s.msg} color={pc[s.phase] || "#0ea5e9"} />
      <Controls si={si} total={steps.length} playing={playing} setPlaying={setPlaying} setSi={setSi} speed={speed} setSpeed={setSpeed} accentColor="#22c55e" />
    </div>
  );
}

// ══════════════════════════════════════════
//  預測三：Min-Max Heap getMax
// ══════════════════════════════════════════

function genP3Steps(values) {
  const heap = buildMinMaxHeap(values);
  const steps = [];
  const n = heap.length - 1;
  if (n < 1) return steps;
  steps.push({ heap, hl: [1], sp: [], msg: `Min-Max Heap 已建好，root=${heap[1]}（全域最小）`, phase: "info" });
  if (n === 1) { steps.push({ heap, hl: [], sp: [1], msg: `只有一個節點，max=${heap[1]}`, phase: "result" }); return steps; }
  if (n === 2) { steps.push({ heap, hl: [], sp: [2], msg: `只有左孩子，max=${heap[2]}`, phase: "result" }); return steps; }
  steps.push({ heap, hl: [2, 3], sp: [], msg: `最大值在 Level 1（Max 層）：heap[2]=${heap[2]} vs heap[3]=${heap[3]}`, phase: "compare" });
  const maxIdx = heap[2] >= heap[3] ? 2 : 3;
  steps.push({ heap, hl: [], sp: [maxIdx], msg: `max = heap[${maxIdx}] = ${heap[maxIdx]}`, phase: "result" });
  steps.push({ heap, hl: [1], sp: [maxIdx], msg: `O(1)！min=${heap[1]}（root），max=${heap[maxIdx]}（index ${maxIdx}）`, phase: "final" });
  return steps;
}

function Pred3() {
  const [input, setInput] = useState("30, 20, 50, 10, 40, 35, 5, 25, 60, 15");
  const { steps, si, setSi, playing, setPlaying, speed, setSpeed, run, cur } = usePlayer((v) => genP3Steps(v), [], 1200);
  useEffect(() => { const v = parseInput(input); if (v.length) run(v); }, []);
  const s = cur || { heap: [null], hl: [], sp: [], msg: "", phase: "" };
  const pc = { info: "#0ea5e9", compare: "#f59e0b", result: "#22c55e", final: "#fbbf24" };
  const mmColor = (idx) => {
    const lvl = Math.floor(Math.log2(idx));
    return lvl % 2 === 0 ? { fill: "#0c2d48", stroke: "#0ea5e9", txt: "#7dd3fc" } : { fill: "#3d0a1e", stroke: "#f43f5e", txt: "#fda4af" };
  };
  const mmLabel = (lvl) => ({ text: `L${lvl} ${lvl % 2 === 0 ? "Min" : "Max"}`, color: lvl % 2 === 0 ? "#0ea5e9" : "#f43f5e" });

  return (
    <div>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 10, fontFamily: FONT }}>最大值必定在 root 的孩子（Level 1 Max 層），只需比兩個 → O(1)</p>
      <CodeBlock>
        <div style={{ color: "#fbbf24" }}>Node getMax() {"{"}</div>
        <div style={{ color: "#ccc", paddingLeft: 14 }}>if (n == 1) return heap[1];</div>
        <div style={{ color: "#ccc", paddingLeft: 14 }}>if (n == 2) return heap[2];</div>
        <div style={{ color: "#f59e0b", paddingLeft: 14 }}>return heap[2] &gt;= heap[3] ? heap[2] : heap[3];</div>
        <div style={{ color: "#fbbf24" }}>{"}"}</div>
      </CodeBlock>
      <InputBar input={input} setInput={setInput} onGo={() => { const v = parseInput(input); if (v.length) run(v); }} btnColor="#fbbf24" btnText="#1c1917" />
      <div style={{ background: "#0e0e1e", borderRadius: 10, border: "1px solid #1e1e30", padding: "6px 0 8px" }}>
        <HeapTree heap={s.heap} hl={s.hl} specialNodes={s.sp || []} nodeColor={mmColor} levelLabels={mmLabel} />
      </div>
      <MsgBar msg={s.msg} color={pc[s.phase] || "#0ea5e9"} />
      <Controls si={si} total={steps.length} playing={playing} setPlaying={setPlaying} setSi={setSi} speed={speed} setSpeed={setSpeed} accentColor="#fbbf24" />
    </div>
  );
}

// ══════════════════════════════════════════
//  預測四：Level-Order 印出
// ══════════════════════════════════════════

const LCOLS = ["#06b6d4", "#8b5cf6", "#f43f5e", "#f59e0b", "#22c55e", "#ec4899"];

function genP4Steps(values) {
  const heap = buildMinHeap(values);
  const steps = [];
  const n = heap.length - 1;
  if (n < 1) return steps;
  const maxLvl = Math.floor(Math.log2(n));
  const output = [];
  steps.push({ heap, hl: [], aLvl: -1, output: [], msg: `Min Heap 已建好，開始逐層印出`, phase: "info" });
  for (let lvl = 0; lvl <= maxLvl; lvl++) {
    const st = 1 << lvl, en = Math.min((1 << (lvl + 1)) - 1, n);
    const ids = []; const vals = [];
    for (let i = st; i <= en; i++) { ids.push(i); vals.push(heap[i]); }
    steps.push({ heap, hl: ids, aLvl: lvl, output: [...output], msg: `Level ${lvl}：掃描 index [${st}..${en}]`, phase: "scan" });
    output.push({ level: lvl, values: vals, indices: ids });
    steps.push({ heap, hl: ids, aLvl: lvl, output: [...output], msg: `Level ${lvl} → ${vals.join(", ")}`, phase: "print" });
  }
  steps.push({ heap, hl: [], aLvl: -1, output: [...output], msg: `全部印完！共 ${maxLvl + 1} 層`, phase: "done" });
  return steps;
}

function Pred4() {
  const [input, setInput] = useState("30, 20, 50, 10, 40, 35, 5, 25, 15, 45");
  const { steps, si, setSi, playing, setPlaying, speed, setSpeed, run, cur } = usePlayer((v) => genP4Steps(v), [], 900);
  useEffect(() => { const v = parseInput(input); if (v.length) run(v); }, []);
  const s = cur || { heap: [null], hl: [], aLvl: -1, output: [], msg: "", phase: "" };
  const pc = { info: "#06b6d4", scan: "#8b5cf6", print: "#22c55e", done: "#f59e0b" };
  const lvlColor = (idx) => {
    const l = Math.floor(Math.log2(idx));
    const c = LCOLS[l % LCOLS.length];
    return { fill: c, stroke: c, txt: "#fff" };
  };

  return (
    <div>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 10, fontFamily: FONT }}>用 2^h 計算每層起始 index，逐層遍歷所有節點</p>
      <InputBar input={input} setInput={setInput} onGo={() => { const v = parseInput(input); if (v.length) run(v); }} btnColor="#06b6d4" />
      <div style={{ background: "#0e0e1e", borderRadius: 10, border: "1px solid #1e1e30", padding: "6px 0 8px" }}>
        <HeapTree heap={s.heap} hl={s.hl} nodeColor={lvlColor} />
      </div>
      <div style={{ background: "#0a0a16", borderRadius: 7, border: "1px solid #1e1e30", padding: "8px 12px", marginTop: 8, fontFamily: FONT, fontSize: 12, minHeight: 50 }}>
        <div style={{ color: "#555", marginBottom: 4, fontSize: 10 }}>// 輸出：</div>
        {(s.output || []).map((o, i) => (
          <div key={i} style={{ marginBottom: 2, display: "flex", gap: 8 }}>
            <span style={{ color: LCOLS[o.level % LCOLS.length], fontWeight: 700, minWidth: 60 }}>Level {o.level}:</span>
            <span style={{ color: "#ccc" }}>{o.values.join("  ")}</span>
          </div>
        ))}
        {(!s.output || s.output.length === 0) && <div style={{ color: "#444" }}>等待遍歷...</div>}
      </div>
      <MsgBar msg={s.msg} color={pc[s.phase] || "#06b6d4"} />
      <Controls si={si} total={steps.length} playing={playing} setPlaying={setPlaying} setSi={setSi} speed={speed} setSpeed={setSpeed} accentColor="#06b6d4" />
    </div>
  );
}

// ══════════════════════════════════════════
//  預測五：Verify Heap 性質
// ══════════════════════════════════════════

function corruptHeap(heap, cnt) {
  const h = [...heap]; const n = h.length - 1; if (n < 3) return h;
  for (let c = 0; c < cnt; c++) { const a = 2 + Math.floor(Math.random() * (n - 1)), b = 1 + Math.floor(Math.random() * n); if (a !== b) [h[a], h[b]] = [h[b], h[a]]; }
  return h;
}

function genP5Steps(heap) {
  const steps = [];
  const n = heap.length - 1;
  if (n < 1) return steps;
  const checked = [], errors = [];
  steps.push({ heap, hl: [], pair: [], checked: [], errors: [], msg: `開始驗證：每個 node ≥ 其父節點？`, phase: "info" });
  for (let i = 2; i <= n; i++) {
    const p = Math.floor(i / 2);
    steps.push({ heap, hl: [i, p], pair: [i, p], checked: [...checked], errors: [...errors], msg: `檢查 heap[${i}]=${heap[i]} vs 父 heap[${p}]=${heap[p]}`, phase: "check" });
    if (heap[i] < heap[p]) {
      errors.push({ c: i, p });
      steps.push({ heap, hl: [i, p], pair: [i, p], checked: [...checked], errors: [...errors], msg: `❌ 違規！${heap[i]} < ${heap[p]}`, phase: "error" });
    } else {
      checked.push(i);
      steps.push({ heap, hl: [i, p], pair: [i, p], checked: [...checked], errors: [...errors], msg: `✓ 合法 ${heap[i]} ≥ ${heap[p]}`, phase: "ok" });
    }
  }
  steps.push({ heap, hl: [], pair: [], checked: [...checked], errors: [...errors], msg: errors.length === 0 ? `✅ 全部通過！` : `❌ 發現 ${errors.length} 處違規`, phase: errors.length === 0 ? "pass" : "fail" });
  return steps;
}

function Pred5() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [corrupt, setCorrupt] = useState(false);
  const { steps, si, setSi, playing, setPlaying, speed, setSpeed, run, cur } = usePlayer((h) => genP5Steps(h), [], 500);
  const go = (c) => { const v = parseInput(input); if (!v.length) return; let h = buildMinHeap(v); if (c) h = corruptHeap(h, 2); run(h); };
  useEffect(() => { go(false); }, []);
  const s = cur || { heap: [null], hl: [], pair: [], checked: [], errors: [], msg: "", phase: "" };
  const pc = { info: "#0ea5e9", check: "#f59e0b", ok: "#22c55e", error: "#ef4444", pass: "#22c55e", fail: "#ef4444" };
  const errorNodes = new Set(); (s.errors || []).forEach((e) => { errorNodes.add(e.c); errorNodes.add(e.p); });
  const checkedSet = new Set(s.checked || []);
  const pairSet = new Set(s.pair || []);
  const vColor = (idx) => {
    if (pairSet.has(idx) && !errorNodes.has(idx)) return { fill: "#f59e0b", stroke: "#d97706", txt: "#1c1917" };
    if (errorNodes.has(idx)) return { fill: "#ef4444", stroke: "#dc2626", txt: "#fff" };
    if (checkedSet.has(idx)) return { fill: "#065f46", stroke: "#22c55e", txt: "#6ee7b7" };
    return { fill: "#151525", stroke: "#3a3a50", txt: "#888" };
  };

  return (
    <div>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 10, fontFamily: FONT }}>從 index 2 開始逐一與父節點比較，檢查 ≥ 關係</p>
      <InputBar input={input} setInput={setInput} onGo={() => go(corrupt)} btnColor="#f59e0b" btnText="#1c1917" btnLabel="驗證" />
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <button onClick={() => { setCorrupt(false); go(false); }} style={{ padding: "6px 12px", borderRadius: 6, border: `2px solid ${!corrupt ? "#22c55e" : "#282838"}`, background: !corrupt ? "#052e16" : "#151525", color: !corrupt ? "#22c55e" : "#666", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>正常 Heap</button>
        <button onClick={() => { setCorrupt(true); go(true); }} style={{ padding: "6px 12px", borderRadius: 6, border: `2px solid ${corrupt ? "#ef4444" : "#282838"}`, background: corrupt ? "#450a0a" : "#151525", color: corrupt ? "#ef4444" : "#666", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>故意破壞</button>
      </div>
      <div style={{ background: "#0e0e1e", borderRadius: 10, border: "1px solid #1e1e30", padding: "6px 0 8px" }}>
        <HeapTree heap={s.heap} hl={s.hl} swap={s.pair} nodeColor={vColor} />
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 6, fontFamily: FONT, fontSize: 11 }}>
        <span style={{ color: "#22c55e" }}>✓ {(s.checked || []).length}</span>
        <span style={{ color: "#ef4444" }}>✗ {(s.errors || []).length}</span>
      </div>
      <MsgBar msg={s.msg} color={pc[s.phase] || "#f59e0b"} />
      <Controls si={si} total={steps.length} playing={playing} setPlaying={setPlaying} setSi={setSi} speed={speed} setSpeed={setSpeed} accentColor="#f59e0b" />
    </div>
  );
}

// ══════════════════════════════════════════
//  預測六：改欄位 (概念演示)
// ══════════════════════════════════════════

function Pred6() {
  const [col, setCol] = useState(8);
  const sampleData = [
    ["1", "大學A", "100", "200", "300", "400", "500", "600", "350", "700"],
    ["2", "大學B", "110", "210", "310", "410", "510", "610", "120", "710"],
    ["3", "大學C", "120", "220", "320", "420", "520", "620", "480", "720"],
    ["4", "大學D", "130", "230", "330", "430", "530", "630", "210", "730"],
    ["5", "大學E", "140", "240", "340", "440", "540", "640", "550", "740"],
  ];
  const vals = sampleData.map((r) => parseInt(r[col]) || 0);
  const heap = buildMinHeap(vals);

  return (
    <div>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 10, fontFamily: FONT }}>只需修改 processHeap 裡讀取的欄位 index，Heap 邏輯完全不動</p>
      <CodeBlock>
        <div style={{ color: "#888" }}>// 原本取第 9 欄 (index 8)：</div>
        <div style={{ color: col === 8 ? "#22c55e" : "#555" }}>int graduates = cleanAndToInt(columns[<span style={{ color: "#f59e0b", fontWeight: 700 }}>8</span>]);</div>
        <div style={{ color: "#888", marginTop: 4 }}>// 改成取任意欄位：</div>
        <div style={{ color: col !== 8 ? "#22c55e" : "#555" }}>int graduates = cleanAndToInt(columns[<span style={{ color: "#f59e0b", fontWeight: 700 }}>{col}</span>]);</div>
      </CodeBlock>
      <div style={{ fontSize: 12, color: "#888", fontFamily: FONT, marginBottom: 8 }}>選擇欄位 index（點擊表頭）：</div>
      <div style={{ overflowX: "auto", marginBottom: 12 }}>
        <table style={{ borderCollapse: "collapse", fontFamily: FONT, fontSize: 11, width: "100%" }}>
          <thead>
            <tr>
              {["0:序號", "1:校名", "2", "3", "4", "5", "6", "7", "8:畢業生", "9"].map((h, i) => (
                <th key={i} onClick={() => setCol(i)} style={{ padding: "6px 8px", cursor: "pointer", background: i === col ? "#f59e0b22" : "#0e0e1e", border: `2px solid ${i === col ? "#f59e0b" : "#222"}`, color: i === col ? "#f59e0b" : "#888", borderRadius: 4, whiteSpace: "nowrap" }}>
                  [{i}]{h.includes(":") ? h.split(":")[1] : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sampleData.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ padding: "4px 8px", border: "1px solid #1a1a2a", background: ci === col ? "#f59e0b11" : "transparent", color: ci === col ? "#f59e0b" : "#666", fontWeight: ci === col ? 700 : 400, textAlign: "center" }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 12, color: "#ccc", fontFamily: FONT, marginBottom: 6 }}>
        使用 column[{col}] 的值建 Min Heap：[{vals.join(", ")}]
      </div>
      <div style={{ background: "#0e0e1e", borderRadius: 10, border: "1px solid #1e1e30", padding: "6px 0 8px" }}>
        <HeapTree heap={heap} />
      </div>
      <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, background: "#22c55e15", border: "2px solid #22c55e44", color: "#22c55e", fontSize: 12, fontWeight: 600, fontFamily: FONT }}>
        root（最小值）= {heap[1]}，來自 column[{col}]
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
//  預測七：Heap Sort
// ══════════════════════════════════════════

function genP7Steps(values) {
  const heap = buildMinHeap(values);
  const steps = [];
  const sorted = [];
  steps.push({ heap: [...heap], hl: [], swap: null, sorted: [], msg: `Min Heap 建好（${heap.length - 1} 個），開始 Heap Sort`, phase: "info" });
  while (heap.length > 2) {
    const mv = heap[1], li = heap.length - 1;
    steps.push({ heap: [...heap], hl: [1], swap: null, sorted: [...sorted], msg: `取出 root=${mv}`, phase: "extract" });
    heap[1] = heap[li]; heap.pop();
    let i = 1, n = heap.length - 1;
    while (2 * i <= n) {
      let c = 2 * i;
      if (c + 1 <= n && heap[c + 1] < heap[c]) c++;
      if (heap[i] > heap[c]) {
        steps.push({ heap: [...heap], hl: [i, c], swap: [i, c], sorted: [...sorted], msg: `siftDown：${heap[i]} ↔ ${heap[c]}`, phase: "sift" });
        [heap[i], heap[c]] = [heap[c], heap[i]];
        i = c;
      } else break;
    }
    sorted.push(mv);
    steps.push({ heap: [...heap], hl: [], swap: null, sorted: [...sorted], msg: `取出 ${mv} → [${sorted.join(", ")}]`, phase: "sorted" });
  }
  if (heap.length === 2) { sorted.push(heap[1]); steps.push({ heap: [null], hl: [], swap: null, sorted: [...sorted], msg: `✅ 完成：[${sorted.join(", ")}]`, phase: "done" }); }
  return steps;
}

function Pred7() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const { steps, si, setSi, playing, setPlaying, speed, setSpeed, run, cur } = usePlayer((v) => genP7Steps(v), [], 450);
  useEffect(() => { const v = parseInput(input); if (v.length) run(v); }, []);
  const s = cur || { heap: [null], hl: [], swap: null, sorted: [], msg: "", phase: "" };
  const pc = { info: "#0ea5e9", extract: "#f59e0b", sift: "#14b8a6", sorted: "#0ea5e9", done: "#22c55e" };
  const total = parseInput(input).length;
  const pct = total > 0 ? ((s.sorted || []).length / total) * 100 : 0;

  return (
    <div>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 10, fontFamily: FONT }}>建 Min Heap → 反覆 deleteMin → 由小到大排序，O(n log n)</p>
      <InputBar input={input} setInput={setInput} onGo={() => { const v = parseInput(input); if (v.length) run(v); }} btnColor="#14b8a6" btnText="#042f2e" btnLabel="排序" />
      <div style={{ height: 5, borderRadius: 3, background: "#1a1a2e", overflow: "hidden", marginBottom: 10 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #14b8a6, #0ea5e9)", borderRadius: 3, transition: "width 0.3s" }} />
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 380px", background: "#0e0e1e", borderRadius: 10, border: "1px solid #1e1e30", padding: "6px 0 8px", minHeight: 160 }}>
          <HeapTree heap={s.heap} hl={s.hl} swap={s.swap} nodeColor={() => ({ fill: "#0ea5e9", stroke: "#0284c7", txt: "#fff" })} />
        </div>
        <div style={{ flex: "1 1 180px", background: "#0e0e1e", borderRadius: 10, border: "1px solid #1e1e30", padding: "10px" }}>
          <div style={{ fontSize: 11, color: "#14b8a6", fontWeight: 700, fontFamily: FONT, marginBottom: 6 }}>已排序：</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {(s.sorted || []).map((v, i) => (
              <div key={i} style={{ width: 36, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 5, background: "#042f2e", border: "1px solid #14b8a644", color: "#14b8a6", fontSize: 12, fontWeight: 700, fontFamily: FONT }}>{v}</div>
            ))}
          </div>
          {(!s.sorted || s.sorted.length === 0) && <div style={{ color: "#444", fontSize: 12, fontFamily: FONT }}>等待中...</div>}
        </div>
      </div>
      <MsgBar msg={s.msg} color={pc[s.phase] || "#0ea5e9"} />
      <Controls si={si} total={steps.length} playing={playing} setPlaying={setPlaying} setSi={setSi} speed={speed} setSpeed={setSpeed} accentColor="#14b8a6" />
    </div>
  );
}

// ══════════════════════════════════════════
//  主程式：Tab 導覽
// ══════════════════════════════════════════

const TABS = [
  { key: "p1", label: "1. Max Heap", color: "#ef4444", component: Pred1 },
  { key: "p2", label: "2. DeleteMin", color: "#22c55e", component: Pred2 },
  { key: "p3", label: "3. GetMax", color: "#fbbf24", component: Pred3 },
  { key: "p4", label: "4. Level Print", color: "#06b6d4", component: Pred4 },
  { key: "p5", label: "5. Verify", color: "#f59e0b", component: Pred5 },
  { key: "p6", label: "6. 換欄位", color: "#a855f7", component: Pred6 },
  { key: "p7", label: "7. Heap Sort", color: "#14b8a6", component: Pred7 },
];

export default function AllPredictions() {
  const [activeTab, setActiveTab] = useState("p1");
  const active = TABS.find((t) => t.key === activeTab);
  const ActiveComponent = active.component;

  return (
    <div style={{ minHeight: "100vh", background: "#08081a", color: "#e0e0e0", fontFamily: "'Segoe UI', sans-serif", padding: "20px 12px" }}>
      <link href={FONT_URL} rel="stylesheet" />

      <h1 style={{ textAlign: "center", fontSize: 20, fontWeight: 800, margin: "0 0 4px", fontFamily: FONT, letterSpacing: "-0.5px" }}>
        <span style={{ color: "#60a5fa" }}>機測預測</span> — 7 大可能修改
      </h1>
      <p style={{ textAlign: "center", fontSize: 11, color: "#555", margin: "0 0 16px", fontFamily: FONT }}>
        點擊下方標籤切換不同預測情境的互動演示
      </p>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center", marginBottom: 16 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: "7px 12px",
              borderRadius: 7,
              border: `2px solid ${activeTab === t.key ? t.color : "#1e1e30"}`,
              background: activeTab === t.key ? t.color + "18" : "#111",
              color: activeTab === t.key ? t.color : "#555",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: FONT,
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Active panel */}
      <div style={{ maxWidth: 740, margin: "0 auto", background: "#0c0c1c", borderRadius: 12, border: `1px solid ${active.color}33`, padding: "16px 14px" }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: active.color, margin: "0 0 8px", fontFamily: FONT }}>
          預測{active.label}
        </h2>
        <ActiveComponent />
      </div>
    </div>
  );
}
