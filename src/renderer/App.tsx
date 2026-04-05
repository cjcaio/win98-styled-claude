import { useDesktopStore } from '@/stores/desktop'
import BootScreen from '@/components/boot/BootScreen'
import LoginScreen from '@/components/login/LoginScreen'
import Desktop from '@/components/desktop/Desktop'
import ShutdownScreen from '@/components/shutdown/ShutdownScreen'

export default function App() {
  const { booted, loggedIn, isShuttingDown } = useDesktopStore()

  return (
    <>
      {!booted && <BootScreen />}
      {booted && !loggedIn && <LoginScreen />}
      {booted && loggedIn && <Desktop />}
      {isShuttingDown && <ShutdownScreen />}
    </>
  )
}
