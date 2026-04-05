export default function BrowserIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      {/* Globe background */}
      <circle cx="16" cy="16" r="14" fill="#1260C8" />
      <circle cx="16" cy="16" r="14" fill="none" stroke="#0A48A0" strokeWidth="1" />

      {/* Latitude lines */}
      <path d="M3 16 Q16 12 29 16" stroke="#1878E0" strokeWidth="0.7" fill="none" />
      <path d="M3 16 Q16 20 29 16" stroke="#1878E0" strokeWidth="0.7" fill="none" />
      <path d="M5 10 Q16 7 27 10" stroke="#1878E0" strokeWidth="0.7" fill="none" />
      <path d="M5 22 Q16 25 27 22" stroke="#1878E0" strokeWidth="0.7" fill="none" />

      {/* Longitude curve */}
      <ellipse cx="16" cy="16" rx="6" ry="13" fill="none" stroke="#1878E0" strokeWidth="0.7" />

      {/* White "e" — built from pixel-art rectangles */}
      {/* Top bar */}
      <rect x="9" y="9" width="13" height="2" fill="white" shapeRendering="crispEdges" />
      {/* Left vertical */}
      <rect x="9" y="9" width="2" height="14" fill="white" shapeRendering="crispEdges" />
      {/* Middle bar */}
      <rect x="9" y="15" width="11" height="2" fill="white" shapeRendering="crispEdges" />
      {/* Bottom bar */}
      <rect x="9" y="21" width="13" height="2" fill="white" shapeRendering="crispEdges" />
      {/* Right side — top arc */}
      <rect x="20" y="9" width="2" height="4" fill="white" shapeRendering="crispEdges" />
      {/* Right side — bottom arc */}
      <rect x="20" y="19" width="2" height="4" fill="white" shapeRendering="crispEdges" />

      {/* Inner fill of "e" (cut out globe colour) */}
      <rect x="11" y="11" width="9" height="4" fill="#1260C8" shapeRendering="crispEdges" />
      <rect x="11" y="17" width="9" height="4" fill="#1260C8" shapeRendering="crispEdges" />

      {/* Golden swoosh ribbon */}
      <path
        d="M2 24 Q8 19 16 15 Q22 11 30 8"
        stroke="#F8B828"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M2 24 Q8 19 16 15 Q22 11 30 8"
        stroke="#FDD060"
        strokeWidth="0.8"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  )
}
