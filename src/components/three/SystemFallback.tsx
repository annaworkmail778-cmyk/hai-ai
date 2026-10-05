/**
 * Static axonometric drawing of the system — shown when WebGL is unavailable.
 * Same composition as the 3D object in its resolved state.
 */
export function SystemFallback({ className }: { className?: string }) {
  // Isometric projection helpers.
  const iso = (x: number, y: number, z: number): [number, number] => [
    (x - z) * 0.866 * 100,
    (x + z) * 0.5 * 100 - y * 100,
  ];
  const plate = (y: number) => {
    const pts = [
      iso(-1.1, y, -1.1),
      iso(1.1, y, -1.1),
      iso(1.1, y, 1.1),
      iso(-1.1, y, 1.1),
    ];
    return pts.map((p) => p.join(",")).join(" ");
  };
  const levels = [-1.25, -0.4, 0.45, 1.3];
  const corners: Array<[number, number]> = [
    [-1.1, -1.1],
    [1.1, -1.1],
    [1.1, 1.1],
    [-1.1, 1.1],
  ];
  const inner: Array<[number, number]> = [
    [-0.55, -0.55],
    [0.55, -0.55],
    [0.55, 0.55],
    [-0.55, 0.55],
  ];

  return (
    <svg viewBox="-260 -230 520 460" className={className} aria-hidden="true" fill="none">
      {corners.map(([x, z], i) => {
        const [x1, y1] = iso(x, levels[0], z);
        const [x2, y2] = iso(x, levels[3] + 0.6, z);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#cfcfcf" strokeWidth="1" opacity="0.6" />;
      })}
      {levels.slice(0, 3).map((y, g) =>
        inner.map(([x, z], i) => {
          const [x1, y1] = iso(x, y, z);
          const [x2, y2] = iso(x, levels[g + 1], z);
          return (
            <line
              key={`${g}-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={g === 1 && i === 2 ? "#ff5b14" : "#8c8c8c"}
              strokeWidth="1"
            />
          );
        }),
      )}
      {levels.map((y, i) => (
        <polygon key={i} points={plate(y)} fill="#111" stroke="#d6d6d6" strokeWidth="1" />
      ))}
      <polygon points={plate(levels[3] + 0.6)} stroke="#cfcfcf" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}
