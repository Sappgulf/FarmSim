import React, { memo, useMemo } from 'react';

/**
 * Sparkline — SVG mini chart component
 * Props:
 *   data: number[]
 *   width: number (default 120)
 *   height: number (default 40)
 *   color: string (default '#10b981')
 *   fill: boolean (default false)
 *   strokeWidth: number (default 2)
 *   className: string
 */
const Sparkline = memo(({
  data,
  width = 120,
  height = 40,
  color = '#10b981',
  fill = false,
  strokeWidth = 2,
  className = '',
}) => {
  const pathData = useMemo(() => {
    if (!Array.isArray(data) || data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = strokeWidth;
    const plotWidth = width - padding * 2;
    const plotHeight = height - padding * 2;

    const points = data.map((value, index) => ({
      x: padding + (index / (data.length - 1)) * plotWidth,
      y: padding + plotHeight - ((value - min) / range) * plotHeight,
    }));

    // Build smooth cubic bezier path
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    return { d, points, min, max, range };
  }, [data, width, height, strokeWidth]);

  if (!pathData) return null;

  const { d, points } = pathData;
  const lastPoint = points[points.length - 1];
  const fillPath = fill
    ? `${d} L ${lastPoint.x} ${height} L ${points[0].x} ${height} Z`
    : null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible ${className}`}
      aria-hidden="true"
    >
      {fill && (
        <path
          d={fillPath}
          fill={color}
          opacity={0.12}
        />
      )}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={lastPoint.x}
        cy={lastPoint.y}
        r={2.5}
        fill={color}
      />
    </svg>
  );
});

Sparkline.displayName = 'Sparkline';
export default Sparkline;
