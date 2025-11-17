// Simple SVG-based chart components

export function BarChart({ data, colors, height = 200 }) {
  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = 80;
  const spacing = 120;
  const chartWidth = data.length * spacing;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${chartWidth} ${height}`} style={{ overflow: 'visible' }}>
      {data.map((item, idx) => {
        const barHeight = maxValue > 0 ? (item.value / maxValue) * (height - 60) : 0;
        const x = idx * spacing + 20;
        const y = height - barHeight - 40;

        return (
          <g key={idx}>
            {/* Bar */}
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={colors[idx]}
              rx="6"
            />
            {/* Value label */}
            <text
              x={x + barWidth / 2}
              y={y - 8}
              textAnchor="middle"
              fill="white"
              fontSize="16"
              fontWeight="700"
            >
              {item.value}
            </text>
            {/* Icon */}
            <text
              x={x + barWidth / 2}
              y={height - 18}
              textAnchor="middle"
              fontSize="24"
            >
              {item.icon}
            </text>
            {/* Label */}
            <text
              x={x + barWidth / 2}
              y={height - 2}
              textAnchor="middle"
              fill="white"
              fontSize="13"
              fontWeight="500"
            >
              {item.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function ConfidenceGauge({ value, maxValue = 5, label }) {
  const percentage = (value / maxValue) * 100;
  const radius = 70;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Color based on confidence level
  let color = '#ef4444'; // red
  if (value >= 4) color = '#22c55e'; // green
  else if (value >= 3) color = '#eab308'; // yellow

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="180" height="180" viewBox="0 0 180 180">
        {/* Background circle */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 90 90)"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        {/* Center text */}
        <text
          x="90"
          y="85"
          textAnchor="middle"
          fill="white"
          fontSize="40"
          fontWeight="700"
        >
          {value}
        </text>
        <text
          x="90"
          y="105"
          textAnchor="middle"
          fill="rgba(255,255,255,0.7)"
          fontSize="16"
        >
          / {maxValue}
        </text>
      </svg>
      <div style={{ color: 'white', fontSize: '16px', fontWeight: '600', marginTop: '10px' }}>
        {label}
      </div>
    </div>
  );
}

export function ProgressIndicator({ value, previousValue, label }) {
  const change = value - previousValue;
  const isPositive = change > 0;
  const isNeutral = change === 0;

  let color = '#22c55e'; // green for positive
  if (!isPositive && !isNeutral) color = '#ef4444'; // red for negative
  if (isNeutral) color = '#94a3b8'; // gray for neutral

  return (
    <div style={{
      background: 'rgba(255,255,255,0.1)',
      padding: '20px',
      borderRadius: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <div style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '5px' }}>
          {label}
        </div>
        <div style={{ fontSize: '28px', fontWeight: '700', color: 'white' }}>
          {typeof value === 'number' ? value.toFixed(1) : value}
        </div>
      </div>
      <div style={{
        fontSize: '32px',
        fontWeight: '700',
        color: color,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {isPositive && '↑'}
        {!isPositive && !isNeutral && '↓'}
        {isNeutral && '→'}
        <span style={{ fontSize: '24px' }}>
          {isPositive ? '+' : ''}{typeof change === 'number' ? change.toFixed(1) : change}
        </span>
      </div>
    </div>
  );
}

export function PieChart({ data, size = 160 }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return <div>No data</div>;

  let cumulativePercent = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((item, idx) => {
        const percent = (item.value / total) * 100;
        const startAngle = (cumulativePercent / 100) * 360;
        const endAngle = ((cumulativePercent + percent) / 100) * 360;

        cumulativePercent += percent;

        const radius = size / 2 - 10;
        const centerX = size / 2;
        const centerY = size / 2;

        // Calculate arc path
        const startRad = (startAngle - 90) * (Math.PI / 180);
        const endRad = (endAngle - 90) * (Math.PI / 180);

        const x1 = centerX + radius * Math.cos(startRad);
        const y1 = centerY + radius * Math.sin(startRad);
        const x2 = centerX + radius * Math.cos(endRad);
        const y2 = centerY + radius * Math.sin(endRad);

        const largeArc = percent > 50 ? 1 : 0;

        const pathData = [
          `M ${centerX} ${centerY}`,
          `L ${x1} ${y1}`,
          `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
          'Z'
        ].join(' ');

        return (
          <path
            key={idx}
            d={pathData}
            fill={item.color}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
}
