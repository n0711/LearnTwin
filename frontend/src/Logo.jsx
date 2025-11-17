function Logo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Twin rising bars */}
      <rect x="25" y="40" width="18" height="50" rx="4" fill="#4F46E5" />
      <rect x="57" y="20" width="18" height="70" rx="4" fill="#34D399" />

      {/* Connection line between bars */}
      <path d="M43 60 L57 40" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

export default Logo;
