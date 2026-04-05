export default function SpotifyIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill="#1DB954" />
      <path d="M8 12 Q16 7 25 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M9 17 Q16 13 24 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M10 22 Q16 19 23 21" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  )
}
