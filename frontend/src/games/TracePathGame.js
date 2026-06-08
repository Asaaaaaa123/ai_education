import React, { useRef, useState } from 'react';
import { buildResult } from './scoring';
import './games.css';

export default function TracePathGame({ onComplete, language = 'en' }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const points = useRef(0);
  const [done, setDone] = useState(false);

  const start = (e) => {
    drawing.current = true;
    const ctx = canvasRef.current?.getContext('2d');
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx?.beginPath();
    ctx?.moveTo(x, y);
    points.current += 1;
  };

  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#3182ce';
    ctx.lineTo(x, y);
    ctx.stroke();
    points.current += 1;
  };

  const end = () => {
    drawing.current = false;
  };

  const submit = () => {
    const score = Math.min(95, 50 + Math.min(points.current, 80));
    setDone(true);
    onComplete(buildResult('trace_path', { stroke_points: points.current }, score));
  };

  return (
    <div className="game-panel">
      <h4>{language === 'zh' ? '轨迹描线（精细动作）' : 'Trace the path (fine motor)'}</h4>
      <p className="game-meta">
        {language === 'zh'
          ? '沿虚线描画曲线或圆圈，锻炼手眼协调。'
          : 'Trace along the dashed line to build hand–eye coordination.'}
      </p>
      <canvas
        ref={canvasRef}
        className="game-trace-canvas"
        width={300}
        height={180}
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
      />
      {!done && (
        <button type="button" className="btn btn-primary" style={{ marginTop: '0.75rem' }} onClick={submit}>
          {language === 'zh' ? '完成描线' : 'Done tracing'}
        </button>
      )}
    </div>
  );
}
