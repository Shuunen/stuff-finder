import { Link } from 'preact-router/match'

const isLocalhost = window.location.hostname === 'localhost'

export function AppNavigation () {
  if (!isLocalhost) return (<nav />)
  return (
    <nav className="fixed bottom-5 left-0 flex w-full justify-center gap-6">
      <Link activeClassName="active" href="/">Home</Link>
      <Link activeClassName="active" href="/settings">Settings</Link>
    </nav>
  )
}
