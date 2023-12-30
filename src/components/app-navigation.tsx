import { Link } from 'preact-router/match'
import { state } from '../utils/state.utils'

const isLocalhost = window.location.hostname === 'localhost'

export function AppNavigation () {
  if (!isLocalhost) return (<nav data-component="navigation" />)
  return (
    <nav className="fixed bottom-5 left-0 flex w-full justify-center gap-6" data-component="navigation">
      <Link activeClassName="active" href="/">Home</Link>
      <Link activeClassName="active" href="/settings">Settings</Link>
      <Link activeClassName="active" href="/scan">Scan</Link>
      <pre>status : {state.status}</pre>
    </nav>
  )
}
