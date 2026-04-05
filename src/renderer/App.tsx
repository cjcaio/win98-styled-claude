import { useDesktopStore } from '@/stores/desktop'
import BootScreen from '@/components/boot/BootScreen'
import Desktop from '@/components/desktop/Desktop'

export default function App() {
  const booted = useDesktopStore((s) => s.booted)

  return (
    <>
      {!booted && <BootScreen />}
      {booted && <Desktop />}
    </>
  )
}
