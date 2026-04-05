export default function SettingsIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" shapeRendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      {/* Back panel (blue window) */}
      <rect x="2" y="8" width="18" height="14" fill="#000080" />
      <rect x="2" y="8" width="18" height="3" fill="#0000A8" />
      <rect x="2" y="8" width="18" height="1" fill="#5858E8" />
      <rect x="2" y="8" width="1" height="14" fill="#5858E8" />
      <rect x="19" y="9" width="1" height="13" fill="#000040" />
      <rect x="2" y="21" width="18" height="1" fill="#000040" />
      {/* Back window content */}
      <rect x="3" y="12" width="16" height="8" fill="#C0C0C0" />
      <rect x="4" y="13" width="4" height="1" fill="#808080" />
      <rect x="4" y="15" width="6" height="1" fill="#808080" />
      <rect x="4" y="17" width="5" height="1" fill="#808080" />
      {/* Front panel (gray window) */}
      <rect x="12" y="14" width="18" height="16" fill="#C0C0C0" />
      <rect x="12" y="14" width="18" height="1" fill="#FFFFFF" />
      <rect x="12" y="14" width="1" height="16" fill="#FFFFFF" />
      <rect x="29" y="15" width="1" height="15" fill="#808080" />
      <rect x="12" y="29" width="18" height="1" fill="#808080" />
      {/* Front title bar */}
      <rect x="12" y="14" width="18" height="4" fill="#000080" />
      <rect x="12" y="14" width="18" height="1" fill="#5858E8" />
      {/* Title bar dots */}
      <rect x="13" y="16" width="8" height="1" fill="#FFFFFF" />
      {/* Slider track */}
      <rect x="14" y="20" width="14" height="2" fill="#FFFFFF" />
      <rect x="14" y="20" width="14" height="1" fill="#808080" />
      <rect x="14" y="20" width="1" height="2" fill="#808080" />
      {/* Slider thumb */}
      <rect x="18" y="19" width="4" height="4" fill="#C0C0C0" />
      <rect x="18" y="19" width="4" height="1" fill="#FFFFFF" />
      <rect x="18" y="19" width="1" height="4" fill="#FFFFFF" />
      <rect x="21" y="20" width="1" height="3" fill="#808080" />
      <rect x="19" y="22" width="2" height="1" fill="#808080" />
      {/* Radio buttons row */}
      <rect x="14" y="25" width="3" height="3" fill="#FFFFFF" />
      <rect x="14" y="25" width="3" height="1" fill="#808080" />
      <rect x="14" y="25" width="1" height="3" fill="#808080" />
      <rect x="16" y="26" width="1" height="2" fill="#808080" />
      <rect x="15" y="27" width="1" height="1" fill="#808080" />
      <rect x="19" y="25" width="3" height="3" fill="#FFFFFF" />
      <rect x="19" y="25" width="3" height="1" fill="#808080" />
      <rect x="19" y="25" width="1" height="3" fill="#808080" />
      <rect x="21" y="26" width="1" height="2" fill="#808080" />
      <rect x="20" y="27" width="1" height="1" fill="#808080" />
      <rect x="20" y="26" width="1" height="1" fill="#000080" />
    </svg>
  )
}
