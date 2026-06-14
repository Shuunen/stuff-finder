type AppOfflineWarningProperties = {
  isOffline: boolean
}

export function AppOfflineWarning({ isOffline }: Readonly<AppOfflineWarningProperties>) {
  if (!isOffline) return null
  return (
    <div data-testid="app-offline-warning" role="status" className="bg-pastel-1 px-4 py-2 text-center font-mono text-sm font-semibold text-black">
      You are offline — browsing cached items
    </div>
  )
}
