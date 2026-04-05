export default function ShutdownIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" shapeRendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      {/* Monitor */}
      <rect x="3" y="4" width="20" height="15" fill="#C0C0C0" />
      <rect x="3" y="4" width="20" height="1" fill="#FFFFFF" />
      <rect x="3" y="4" width="1" height="15" fill="#FFFFFF" />
      <rect x="3" y="18" width="20" height="1" fill="#808080" />
      <rect x="22" y="4" width="1" height="15" fill="#808080" />
      {/* Screen - dark/off */}
      <rect x="5" y="6" width="16" height="10" fill="#202020" />
      {/* Power symbol on screen */}
      <rect x="12" y="8" width="2" height="5" fill="#C0C000" />
      <rect x="10" y="9" width="1" height="1" fill="#C0C000" />
      <rect x="9" y="10" width="1" height="2" fill="#C0C000" />
      <rect x="10" y="12" width="1" height="1" fill="#C0C000" />
      <rect x="15" y="9" width="1" height="1" fill="#C0C000" />
      <rect x="16" y="10" width="1" height="2" fill="#C0C000" />
      <rect x="15" y="12" width="1" height="1" fill="#C0C000" />
      {/* Monitor neck */}
      <rect x="9" y="19" width="7" height="2" fill="#A0A0A0" />
      {/* Monitor base */}
      <rect x="5" y="21" width="15" height="3" fill="#C0C0C0" />
      <rect x="5" y="21" width="15" height="1" fill="#E0E0E0" />
      {/* Power button */}
      <rect x="24" y="10" width="7" height="6" fill="#C0C0C0" />
      <rect x="24" y="10" width="7" height="1" fill="#FFFFFF" />
      <rect x="24" y="10" width="1" height="6" fill="#FFFFFF" />
      <rect x="30" y="11" width="1" height="5" fill="#808080" />
      <rect x="24" y="15" width="7" height="1" fill="#808080" />
      <rect x="26" y="12" width="3" height="2" fill="#808080" />
      <rect x="27" y="11" width="1" height="4" fill="#808080" />
    </svg>
  )
}
