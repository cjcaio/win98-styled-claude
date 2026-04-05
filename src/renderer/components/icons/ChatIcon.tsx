export default function ChatIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" shapeRendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      {/* Monitor outer bezel */}
      <rect x="1" y="2" width="26" height="20" fill="#C0C0C0" />
      {/* Bezel highlights */}
      <rect x="1" y="2" width="26" height="1" fill="#FFFFFF" />
      <rect x="1" y="2" width="1" height="20" fill="#FFFFFF" />
      {/* Bezel shadows */}
      <rect x="1" y="21" width="26" height="1" fill="#808080" />
      <rect x="26" y="2" width="1" height="20" fill="#808080" />
      {/* Screen */}
      <rect x="3" y="4" width="22" height="15" fill="#000080" />
      {/* Screen glow lines (scanlines feel) */}
      <rect x="4" y="6" width="3" height="1" fill="#40FF40" />
      <rect x="8" y="6" width="1" height="1" fill="#40FF40" />
      {/* ">" prompt */}
      <rect x="4" y="9" width="1" height="3" fill="#40FF40" />
      <rect x="5" y="10" width="1" height="1" fill="#40FF40" />
      {/* Text lines */}
      <rect x="7" y="9" width="8" height="1" fill="#40FF40" />
      <rect x="7" y="11" width="6" height="1" fill="#40FF40" />
      {/* Blinking cursor */}
      <rect x="14" y="11" width="2" height="1" fill="#40FF40" />
      {/* Second prompt line */}
      <rect x="4" y="14" width="1" height="3" fill="#40FF40" />
      <rect x="5" y="15" width="1" height="1" fill="#40FF40" />
      <rect x="7" y="15" width="5" height="1" fill="#40FF40" />
      <rect x="13" y="15" width="2" height="1" fill="#40FF40" />
      {/* Monitor neck */}
      <rect x="10" y="22" width="8" height="3" fill="#A0A0A0" />
      {/* Monitor base */}
      <rect x="5" y="25" width="18" height="4" fill="#C0C0C0" />
      <rect x="5" y="25" width="18" height="1" fill="#E0E0E0" />
      <rect x="5" y="28" width="18" height="1" fill="#808080" />
      {/* Speech bubble (chat indicator) */}
      <rect x="22" y="14" width="9" height="7" fill="#FFFFFF" />
      <rect x="22" y="14" width="9" height="1" fill="#000000" />
      <rect x="22" y="20" width="9" height="1" fill="#000000" />
      <rect x="22" y="14" width="1" height="7" fill="#000000" />
      <rect x="30" y="14" width="1" height="7" fill="#000000" />
      {/* Bubble tail */}
      <rect x="23" y="21" width="1" height="1" fill="#000000" />
      <rect x="24" y="22" width="1" height="1" fill="#000000" />
      {/* Bubble text dots */}
      <rect x="24" y="17" width="1" height="1" fill="#000080" />
      <rect x="26" y="17" width="1" height="1" fill="#000080" />
      <rect x="28" y="17" width="1" height="1" fill="#000080" />
    </svg>
  )
}
