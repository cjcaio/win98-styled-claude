export default function RecycleBinIcon({ size = 32, full = false }: { size?: number; full?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" shapeRendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      {/* Handle */}
      <rect x="12" y="4" width="8" height="2" fill="#4878C0" />
      <rect x="11" y="5" width="10" height="2" fill="#5888D0" />
      {/* Lid */}
      <rect x="4" y="7" width="24" height="4" fill="#5888D0" />
      <rect x="4" y="7" width="24" height="1" fill="#90B8F0" />
      <rect x="4" y="7" width="1" height="4" fill="#90B8F0" />
      <rect x="27" y="8" width="1" height="3" fill="#2850A0" />
      <rect x="4" y="10" width="24" height="1" fill="#2850A0" />
      {/* Body - trapezoid using polygon */}
      <polygon points="6,11 26,11 24,29 8,29" fill="#4878C0" />
      {/* Body highlight */}
      <polygon points="6,11 8,11 6,29 6,11" fill="#80A8F0" />
      {/* Body shadow */}
      <polygon points="24,11 26,11 26,29 24,29" fill="#2850A0" />
      <rect x="8" y="28" width="16" height="1" fill="#2850A0" />
      {/* Vertical lines on bin */}
      <rect x="11" y="13" width="1" height="13" fill="#3060B0" />
      <rect x="15" y="13" width="1" height="13" fill="#3060B0" />
      <rect x="19" y="13" width="1" height="13" fill="#3060B0" />
      {/* Paper sticking out if full */}
      {full && (
        <>
          <rect x="13" y="8" width="6" height="5" fill="#FFFFCC" />
          <rect x="13" y="8" width="6" height="1" fill="#CCCC88" />
          <rect x="13" y="9" width="1" height="4" fill="#CCCC88" />
          <rect x="18" y="8" width="1" height="5" fill="#CCCC88" />
          <rect x="14" y="10" width="4" height="1" fill="#888844" />
          <rect x="14" y="12" width="3" height="1" fill="#888844" />
        </>
      )}
    </svg>
  )
}
