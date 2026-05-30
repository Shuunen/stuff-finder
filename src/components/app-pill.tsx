type AppPillProperties = {
  className?: string
  children: React.ReactNode
}

export function AppPill({ children, className }: Readonly<AppPillProperties>) {
  return <div className={`shadow-chunky-sm border-ink inline-flex items-center rounded-full border-2 px-3 py-1 font-mono text-sm font-bold ${className}`}>{children}</div>
}
