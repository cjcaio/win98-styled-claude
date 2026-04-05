import { useDesktopStore } from '@/stores/desktop'
import BootScreen from '@/components/boot/BootScreen'
import LoginScreen from '@/components/login/LoginScreen'
import Desktop from '@/components/desktop/Desktop'

export default function App() {
  const { booted, loggedIn } = useDesktopStore()

  return (
    <>
      {!booted && <BootScreen />}
      {booted && !loggedIn && <LoginScreen />}
      {booted && loggedIn && <Desktop />}
    </>
  )
}
