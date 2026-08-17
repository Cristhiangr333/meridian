function pt(cx: number, cy: number, angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

export function EdgeRadar({
  winRate,
  expectancyNorm,
  consistency,
  discipline,
  score,
}: {
  winRate: number;
  expectancyNorm: number;
  consistency: number;
  discipline: number;
  score: number;
}) {
  const cx = 120;
  const cy = 120;
  const maxR = 90;

  const top = pt(cx, cy, 0, (winRate / 100) * maxR);
  const right = pt(cx, cy, 90, (expectancyNorm / 100) * maxR);
  const bottom = pt(cx, cy, 180, (consistency / 100) * maxR);
  const left = pt(cx, cy, 270, (discipline / 100) * maxR);
  const points = `${top.x},${top.y} ${right.x},${right.y} ${bottom.x},${bottom.y} ${left.x},${left.y}`;

  return (
    <svg
      viewBox="0 0 240 240"
      className="w-full max-w-[220px] h-auto mx-auto"
      role="img"
      aria-label={`Edge score ${score} de 100`}
    >
      {[22.5, 45, 67.5, 90].map((r) => (
        <circle
          key={r}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(28,18,41,.08)"
          strokeWidth={1}
        />
      ))}
      <line x1={cx} y1={cy - maxR} x2={cx} y2={cy + maxR} stroke="rgba(28,18,41,.08)" />
      <line x1={cx - maxR} y1={cy} x2={cx + maxR} y2={cy} stroke="rgba(28,18,41,.08)" />

      <polygon
        points={points}
        fill="rgba(107,47,179,.09)"
        stroke="#6B2FB3"
        strokeWidth={1.6}
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 6px rgba(107,47,179,.35))" }}
      />
      {[top, right, bottom, left].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#F8F4EC" stroke="#A9812E" strokeWidth={2} />
      ))}

      <text
        x={cx}
        y={116}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={32}
        fontWeight={600}
        fill="#1C1229"
      >
        {score}
      </text>
      <text
        x={cx}
        y={132}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={8}
        letterSpacing={1}
        fill="#7A7190"
      >
        EDGE SCORE
      </text>

      <text x={cx} y={18} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={9} fill="#5C5470">
        WIN RATE
      </text>
      <text x={cx + maxR + 6} y={cy + 4} textAnchor="start" fontFamily="var(--font-mono)" fontSize={9} fill="#5C5470">
        EXPECTANCY
      </text>
      <text x={cx} y={cy + maxR + 16} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={9} fill="#5C5470">
        CONSISTENCIA
      </text>
      <text x={cx - maxR - 6} y={cy + 4} textAnchor="end" fontFamily="var(--font-mono)" fontSize={9} fill="#5C5470">
        DISCIPLINA
      </text>
    </svg>
  );
}
