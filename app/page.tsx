"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };
type Hole = { name: string; par: number; start: Point; cup: Point; walls: Point[][]; blocks: { x: number; y: number; w: number; h: number; r: number }[]; color: string };

const W = 900;
const H = 560;
const holes: Hole[] = [
  { name: "Korkenzieher", par: 3, start: { x: 115, y: 455 }, cup: { x: 770, y: 110 }, color: "#ffbd68", walls: [[{ x: 70, y: 70 }, { x: 830, y: 70 }, { x: 830, y: 490 }, { x: 70, y: 490 }]], blocks: [{ x: 260, y: 180, w: 220, h: 32, r: 16 }, { x: 535, y: 330, w: 190, h: 32, r: 16 }] },
  { name: "Die Insel", par: 4, start: { x: 125, y: 280 }, cup: { x: 765, y: 280 }, color: "#7ee2cf", walls: [[{ x: 70, y: 70 }, { x: 830, y: 70 }, { x: 830, y: 490 }, { x: 70, y: 490 }]], blocks: [{ x: 305, y: 70, w: 34, h: 180, r: 17 }, { x: 560, y: 310, w: 34, h: 180, r: 17 }, { x: 390, y: 260, w: 120, h: 40, r: 20 }] },
  { name: "Nachtlicht", par: 3, start: { x: 135, y: 440 }, cup: { x: 770, y: 120 }, color: "#a99bff", walls: [[{ x: 70, y: 70 }, { x: 830, y: 70 }, { x: 830, y: 490 }, { x: 70, y: 490 }]], blocks: [{ x: 200, y: 150, w: 36, h: 270, r: 18 }, { x: 420, y: 70, w: 36, h: 260, r: 18 }, { x: 640, y: 230, w: 36, h: 260, r: 18 }] },
  { name: "Zickzack", par: 4, start: { x: 115, y: 280 }, cup: { x: 780, y: 280 }, color: "#ff9b72", walls: [], blocks: [{ x: 240, y: 70, w: 32, h: 300, r: 16 }, { x: 470, y: 190, w: 32, h: 300, r: 16 }, { x: 700, y: 70, w: 32, h: 300, r: 16 }] },
  { name: "Wellenritt", par: 3, start: { x: 125, y: 420 }, cup: { x: 770, y: 140 }, color: "#63c8df", walls: [], blocks: [{ x: 260, y: 180, w: 320, h: 30, r: 15 }, { x: 320, y: 350, w: 320, h: 30, r: 15 }] },
  { name: "Doppelpass", par: 4, start: { x: 120, y: 120 }, cup: { x: 780, y: 440 }, color: "#f6c85f", walls: [], blocks: [{ x: 260, y: 140, w: 36, h: 220, r: 18 }, { x: 500, y: 200, w: 36, h: 220, r: 18 }] },
  { name: "Kreuzung", par: 4, start: { x: 120, y: 280 }, cup: { x: 780, y: 280 }, color: "#d994ff", walls: [], blocks: [{ x: 380, y: 70, w: 40, h: 180, r: 20 }, { x: 380, y: 310, w: 40, h: 180, r: 20 }, { x: 500, y: 250, w: 160, h: 40, r: 20 }] },
  { name: "Briefumschlag", par: 3, start: { x: 130, y: 430 }, cup: { x: 770, y: 130 }, color: "#ffb4a2", walls: [], blocks: [{ x: 260, y: 180, w: 360, h: 30, r: 15 }, { x: 260, y: 350, w: 360, h: 30, r: 15 }] },
  { name: "Tunnelblick", par: 4, start: { x: 120, y: 280 }, cup: { x: 780, y: 280 }, color: "#8fe3b2", walls: [], blocks: [{ x: 300, y: 70, w: 300, h: 32, r: 16 }, { x: 300, y: 458, w: 300, h: 32, r: 16 }, { x: 300, y: 70, w: 32, h: 220, r: 16 }, { x: 568, y: 270, w: 32, h: 220, r: 16 }] },
  { name: "Kompass", par: 4, start: { x: 120, y: 440 }, cup: { x: 780, y: 120 }, color: "#ffcf75", walls: [], blocks: [{ x: 360, y: 180, w: 180, h: 32, r: 16 }, { x: 360, y: 348, w: 180, h: 32, r: 16 }, { x: 450, y: 180, w: 32, h: 200, r: 16 }] },
  { name: "Sternbild", par: 3, start: { x: 120, y: 120 }, cup: { x: 780, y: 440 }, color: "#91a9ff", walls: [], blocks: [{ x: 260, y: 260, w: 120, h: 32, r: 16 }, { x: 520, y: 260, w: 120, h: 32, r: 16 }, { x: 400, y: 120, w: 32, h: 120, r: 16 }, { x: 468, y: 320, w: 32, h: 120, r: 16 }] },
  { name: "Schnecke", par: 4, start: { x: 120, y: 120 }, cup: { x: 450, y: 280 }, color: "#a7e8e0", walls: [], blocks: [{ x: 220, y: 120, w: 450, h: 30, r: 15 }, { x: 640, y: 120, w: 30, h: 300, r: 15 }, { x: 300, y: 390, w: 370, h: 30, r: 15 }, { x: 300, y: 240, w: 30, h: 180, r: 15 }] },
  { name: "Vier Waende", par: 4, start: { x: 120, y: 440 }, cup: { x: 780, y: 120 }, color: "#f2a5c9", walls: [], blocks: [{ x: 230, y: 120, w: 32, h: 240, r: 16 }, { x: 440, y: 200, w: 32, h: 240, r: 16 }, { x: 650, y: 120, w: 32, h: 240, r: 16 }] },
  { name: "Lavalampe", par: 3, start: { x: 120, y: 280 }, cup: { x: 780, y: 280 }, color: "#ff8a8a", walls: [], blocks: [{ x: 280, y: 120, w: 90, h: 90, r: 45 }, { x: 520, y: 350, w: 90, h: 90, r: 45 }, { x: 520, y: 120, w: 90, h: 90, r: 45 }, { x: 280, y: 350, w: 90, h: 90, r: 45 }] },
  { name: "Schaltzentrale", par: 4, start: { x: 120, y: 440 }, cup: { x: 780, y: 120 }, color: "#9ce4ff", walls: [], blocks: [{ x: 250, y: 70, w: 34, h: 260, r: 17 }, { x: 500, y: 230, w: 34, h: 260, r: 17 }, { x: 350, y: 180, w: 170, h: 34, r: 17 }] },
  { name: "Achterbahn", par: 4, start: { x: 120, y: 280 }, cup: { x: 780, y: 280 }, color: "#ffae80", walls: [], blocks: [{ x: 250, y: 130, w: 32, h: 300, r: 16 }, { x: 420, y: 70, w: 32, h: 300, r: 16 }, { x: 590, y: 190, w: 32, h: 300, r: 16 }] },
  { name: "Der Spiegel", par: 3, start: { x: 120, y: 420 }, cup: { x: 780, y: 140 }, color: "#b9a6ff", walls: [], blocks: [{ x: 350, y: 70, w: 32, h: 240, r: 16 }, { x: 518, y: 250, w: 32, h: 240, r: 16 }] },
  { name: "Finale", par: 5, start: { x: 120, y: 440 }, cup: { x: 780, y: 120 }, color: "#ffcf68", walls: [], blocks: [{ x: 240, y: 160, w: 420, h: 32, r: 16 }, { x: 240, y: 368, w: 420, h: 32, r: 16 }, { x: 440, y: 192, w: 32, h: 176, r: 16 }] },
];

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number | null>(null);
  const state = useRef({ hole: 0, ball: { ...holes[0].start }, velocity: { x: 0, y: 0 }, moving: false, aiming: false, pointer: { x: 0, y: 0 }, shots: 0, finished: false, theme: "afterglow" as "afterglow" | "future" });
  const [holeIndex, setHoleIndex] = useState(0);
  const [shots, setShots] = useState(0);
  const [message, setMessage] = useState("Zieh vom Ball weg und lass los");
  const [scores, setScores] = useState<number[]>([]);
  const [theme, setTheme] = useState<"afterglow" | "future">("afterglow");

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const h = holes[state.current.hole];
    ctx.clearRect(0, 0, W, H);
    const future = state.current.theme === "future";
    ctx.fillStyle = future ? "#11182f" : "#b9e7bd"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = future ? "#27335e" : "#a9dcae";
    for (let y = 74; y < 490; y += 28) for (let x = 74; x < 830; x += 28) { ctx.globalAlpha = ((x + y) / 28) % 2 ? .11 : .04; ctx.fillRect(x, y, 14, 14); }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = future ? "#4b6ee8" : "#487d68"; ctx.lineWidth = 12; ctx.lineJoin = "round"; ctx.strokeRect(70, 70, 760, 420);
    h.blocks.forEach((b) => { ctx.fillStyle = future ? h.color : "#e98262"; ctx.shadowColor = future ? h.color : "#6c7766"; ctx.shadowBlur = future ? 18 : 9; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.shadowBlur = 0; });
    ctx.beginPath(); ctx.arc(h.cup.x, h.cup.y, 19, 0, Math.PI * 2); ctx.fillStyle = future ? "#6ef4ff" : "#25423b"; ctx.fill();
    ctx.beginPath(); ctx.arc(h.cup.x, h.cup.y, 13, 0, Math.PI * 2); ctx.fillStyle = future ? "#07101e" : "#132a28"; ctx.fill();
    if (state.current.aiming && !state.current.moving) {
      const dx = state.current.ball.x - state.current.pointer.x, dy = state.current.ball.y - state.current.pointer.y;
      const len = Math.min(150, Math.hypot(dx, dy));
      if (len > 5) { const nx = dx / Math.hypot(dx, dy), ny = dy / Math.hypot(dx, dy); ctx.beginPath(); ctx.moveTo(state.current.ball.x, state.current.ball.y); ctx.lineTo(state.current.ball.x + nx * len, state.current.ball.y + ny * len); ctx.strokeStyle = "#fff8df"; ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.setLineDash([10, 10]); ctx.stroke(); ctx.setLineDash([]); }
    }
    ctx.beginPath(); ctx.arc(state.current.ball.x, state.current.ball.y, 13, 0, Math.PI * 2); ctx.fillStyle = future ? "#f8ffff" : "#fffdf2"; ctx.shadowColor = future ? "#6ef4ff" : "#42615a"; ctx.shadowBlur = future ? 16 : 8; ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = future ? "#6ef4ff" : "#40675a"; ctx.lineWidth = 2; ctx.stroke();
  }, []);

  useEffect(() => { const saved = window.localStorage.getItem("minigolf-theme"); if (saved === "future") { state.current.theme = "future"; setTheme("future"); } }, []);
  useEffect(() => { state.current.theme = theme; window.localStorage.setItem("minigolf-theme", theme); draw(); }, [theme, draw]);

  const reset = useCallback((index = state.current.hole) => { state.current = { ...state.current, hole: index, ball: { ...holes[index].start }, velocity: { x: 0, y: 0 }, moving: false, aiming: false, shots: 0, finished: false }; setHoleIndex(index); setShots(0); setMessage("Zieh vom Ball weg und lass los"); draw(); }, [draw]);

  useEffect(() => { draw(); }, [draw, holeIndex]);

  useEffect(() => {
    const tick = () => {
      const s = state.current, h = holes[s.hole];
      if (s.moving) {
        const previous = { x: s.ball.x, y: s.ball.y };
        s.ball.x += s.velocity.x; s.ball.y += s.velocity.y; s.velocity.x *= .985; s.velocity.y *= .985;
        if (s.ball.x < 84 || s.ball.x > 816) { s.velocity.x *= -.82; s.ball.x = Math.max(84, Math.min(816, s.ball.x)); }
        if (s.ball.y < 84 || s.ball.y > 476) { s.velocity.y *= -.82; s.ball.y = Math.max(84, Math.min(476, s.ball.y)); }
        h.blocks.forEach((b) => {
          const left = b.x - 13, right = b.x + b.w + 13, top = b.y - 13, bottom = b.y + b.h + 13;
          const overlaps = s.ball.x > left && s.ball.x < right && s.ball.y > top && s.ball.y < bottom;
          if (!overlaps) return;
          const crossedHorizontal = previous.x <= left || previous.x >= right;
          if (crossedHorizontal) {
            s.ball.x = previous.x <= left ? left : right;
            s.velocity.x *= -0.82;
          } else {
            s.ball.y = previous.y <= top ? top : bottom;
            s.velocity.y *= -0.82;
          }
        });
        if (Math.hypot(s.ball.x - h.cup.x, s.ball.y - h.cup.y) < 17 && Math.hypot(s.velocity.x, s.velocity.y) < 5) { s.ball = { ...h.cup }; s.velocity = { x: 0, y: 0 }; s.moving = false; s.finished = true; setScores((prev) => [...prev, s.shots]); setMessage("Loch geschafft — stark gespielt!"); }
        if (Math.hypot(s.velocity.x, s.velocity.y) < .12) { s.velocity = { x: 0, y: 0 }; s.moving = false; setMessage("Bereit für den nächsten Schlag"); }
      }
      draw(); raf.current = requestAnimationFrame(tick);
    }; raf.current = requestAnimationFrame(tick); return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [draw]);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => { const r = e.currentTarget.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };
  const down = (e: React.PointerEvent<HTMLCanvasElement>) => { const p = point(e), s = state.current; if (!s.moving && !s.finished && Math.hypot(p.x - s.ball.x, p.y - s.ball.y) < 40) { s.aiming = true; s.pointer = p; e.currentTarget.setPointerCapture(e.pointerId); } };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => { if (state.current.aiming) { state.current.pointer = point(e); draw(); } };
  const up = () => { const s = state.current; if (!s.aiming) return; const dx = s.ball.x - s.pointer.x, dy = s.ball.y - s.pointer.y, length = Math.min(150, Math.hypot(dx, dy)); if (length > 8) { const power = length / 9; s.velocity = { x: dx / length * power, y: dy / length * power }; s.moving = true; s.shots++; setShots(s.shots); setMessage("Der Ball rollt …"); } s.aiming = false; };

  return <main className={`app-shell ${theme}`}>
    <header className="topbar"><div className="brand-mark">✦</div><div><p className="eyebrow">{theme === "future" ? "NEON PUTT // 2099" : "SUNSET PUTT CLUB"}</p><h1>Minigolf <span>{theme === "future" ? "Neon Future" : "Afterglow"}</span></h1></div><div className="top-actions"><button className="theme-button" onClick={() => setTheme(theme === "future" ? "afterglow" : "future")}>{theme === "future" ? "☼ Klassisch" : "✦ Futuristisch"}</button><button className="ghost-button" onClick={() => reset()}>↻ <span>Neustart</span></button></div></header>
    <section className="hero"><div><p className="eyebrow">LOCH {holeIndex + 1} / {holes.length}</p><h2>{holes[holeIndex].name}</h2><p className="hint">{message}</p></div><div className="score-pill"><span>Schläge</span><strong>{shots}</strong><small>Par {holes[holeIndex].par}</small></div></section>
    <section className="game-card"><canvas ref={canvasRef} width={W} height={H} onPointerDown={down} onPointerMove={move} onPointerUp={up} aria-label="Minigolf-Bahn. Ziehe vom Ball weg, um zu zielen." /><div className="card-footer"><span><i className="dot orange" /> Hindernisse</span><span><i className="dot dark" /> Loch</span><span className="instruction">Ball anklicken · ziehen · loslassen</span></div></section>
    <section className="bottom-row"><div className="course-list"><p className="eyebrow">DEIN KURS</p><div className="holes">{holes.map((h, i) => <button key={h.name} className={i === holeIndex ? "hole active" : "hole"} onClick={() => reset(i)}><span>{String(i + 1).padStart(2, "0")}</span><strong>{h.name}</strong><small>{scores[i] ? `${scores[i]} Schläge` : `Par ${h.par}`}</small></button>)}</div></div><div className="next-panel">{state.current.finished ? <><p className="eyebrow">RUNDE BEENDET</p><h3>{holeIndex === holes.length - 1 ? "Kurs geschafft!" : "Bereit fürs nächste Loch?"}</h3><button className="primary-button" onClick={() => reset((holeIndex + 1) % holes.length)}>{holeIndex === holes.length - 1 ? "Nochmal spielen" : "Nächstes Loch →"}</button></> : <><p className="eyebrow">TIPP</p><h3>Kurze Schläge sind oft die besten.</h3><p>Die Bande kann dein Freund sein. Nutze sie, um um die Hindernisse zu kommen.</p></>}</div></section>
  </main>;
}
