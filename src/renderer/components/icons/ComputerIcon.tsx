export default function ComputerIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" shapeRendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      {/* Monitor bezel */}
      <rect x="2" y="2" width="22" height="18" fill="#C0C0C0" />
      <rect x="2" y="2" width="22" height="1" fill="#FFFFFF" />
      <rect x="2" y="2" width="1" height="18" fill="#FFFFFF" />
      <rect x="2" y="19" width="22" height="1" fill="#808080" />
      <rect x="23" y="2" width="1" height="18" fill="#808080" />
      {/* Screen */}
      <rect x="4" y="4" width="18" height="13" fill="#000080" />
      {/* Screen content - desktop feel */}
      <rect x="5" y="5" width="16" height="1" fill="#008080" />
      <rect x="5" y="12" width="16" height="4" fill="#C0C0C0" />
      <rect x="5" y="12" width="16" height="1" fill="#000080" />
      {/* Window on screen */}
      <rect x="6" y="7" width="7" height="5" fill="#C0C0C0" />
      <rect x="6" y="7" width="7" height="1" fill="#000080" />
      <rect x="6" y="7" width="1" height="5" fill="#808080" />
      <rect x="12" y="7" width="1" height="5" fill="#808080" />
      <rect x="6" y="11" width="7" height="1" fill="#808080" />
      {/* Taskbar text on screen */}
      <rect x="6" y="13" width="3" height="1" fill="#808080" />
      <rect x="6" y="14" width="3" height="1" fill="#000080" />
      {/* Monitor base neck */}
      <rect x="9" y="20" width="8" height="3" fill="#A0A0A0" />
      {/* Monitor base */}
      <rect x="5" y="23" width="16" height="3" fill="#C0C0C0" />
      <rect x="5" y="23" width="16" height="1" fill="#E0E0E0" />
      <rect x="5" y="25" width="16" height="1" fill="#808080" />
      {/* Keyboard */}
      <rect x="1" y="26" width="30" height="5" fill="#C0C0C0" />
      <rect x="1" y="26" width="30" height="1" fill="#FFFFFF" />
      <rect x="1" y="30" width="30" height="1" fill="#808080" />
      {/* Key rows */}
      <rect x="2" y="27" width="28" height="1" fill="#A0A0A0" />
      <rect x="3" y="29" width="26" height="1" fill="#A0A0A0" />
      {/* Space bar */}
      <rect x="8" y="29" width="16" height="1" fill="#C8C8C8" />
    </svg>
  )
}
