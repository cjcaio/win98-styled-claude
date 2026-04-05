export default function FolderIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" shapeRendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <rect x="3" y="29" width="28" height="1" fill="#808080" />
      <rect x="30" y="11" width="1" height="19" fill="#808080" />
      {/* Tab */}
      <rect x="2" y="9" width="11" height="3" fill="#C88000" />
      <rect x="2" y="9" width="11" height="1" fill="#F0C050" />
      <rect x="2" y="9" width="1" height="3" fill="#F0C050" />
      {/* Body */}
      <rect x="2" y="11" width="28" height="18" fill="#F0B800" />
      {/* Highlight */}
      <rect x="2" y="11" width="28" height="1" fill="#FFE060" />
      <rect x="2" y="12" width="1" height="17" fill="#FFE060" />
      {/* Shadow inner */}
      <rect x="29" y="12" width="1" height="17" fill="#A07800" />
      <rect x="3" y="28" width="26" height="1" fill="#A07800" />
      {/* Sheen line */}
      <rect x="4" y="14" width="22" height="1" fill="#FFD030" />
    </svg>
  )
}
