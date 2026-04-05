export default function MinesweeperIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {/* Gray grid background */}
      <rect x="2" y="2" width="28" height="28" fill="#C0C0C0"/>
      {/* Raised border */}
      <rect x="2" y="2" width="28" height="2" fill="#ffffff"/>
      <rect x="2" y="2" width="2" height="28" fill="#ffffff"/>
      <rect x="2" y="28" width="28" height="2" fill="#808080"/>
      <rect x="28" y="2" width="2" height="28" fill="#808080"/>
      {/* Mine body */}
      <rect x="11" y="9" width="10" height="14" fill="#000000"/>
      <rect x="9" y="11" width="14" height="10" fill="#000000"/>
      <rect x="10" y="10" width="12" height="12" fill="#000000"/>
      {/* Mine spikes */}
      <rect x="15" y="6" width="2" height="4" fill="#000000"/>
      <rect x="15" y="22" width="2" height="4" fill="#000000"/>
      <rect x="6" y="15" width="4" height="2" fill="#000000"/>
      <rect x="22" y="15" width="4" height="2" fill="#000000"/>
      <rect x="9" y="9" width="2" height="2" fill="#000000"/>
      <rect x="21" y="9" width="2" height="2" fill="#000000"/>
      <rect x="9" y="21" width="2" height="2" fill="#000000"/>
      <rect x="21" y="21" width="2" height="2" fill="#000000"/>
      {/* Shine */}
      <rect x="12" y="11" width="3" height="3" fill="#ffffff"/>
    </svg>
  )
}
