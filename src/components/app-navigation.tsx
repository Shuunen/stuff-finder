import { Link } from 'preact-router/match'

export function AppNavigation () {
  const isLocalhost = window.location.hostname === 'localhost'
  if (!isLocalhost) return null
  return (
    <nav class="fixed bottom-5 left-0 w-full justify-center flex gap-6">
      <Link activeClassName="active" href="/">Home</Link>
      <Link activeClassName="active" href="/settings">Settings</Link>
    </nav>
  )
}
