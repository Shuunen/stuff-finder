import type { DrawerGroup } from '../utils/box.utils'
import { AppItemList } from './app-item-list'
import { AppPageSubtitle } from './app-page-subtitle'

const drawerPadLength = 2

export function AppBoxDrawers({ groups }: Readonly<{ groups: DrawerGroup[] }>) {
  if (groups.length === 0) return undefined
  return (
    <div className="mb-22 flex flex-col gap-2 md:mb-26" data-testid="box-drawers">
      {groups.map(group => (
        <section data-testid={`box-drawer-${group.drawer}`} key={group.drawer}>
          <AppPageSubtitle name="box-drawer">
            {group.drawer === -1 ? 'No drawer' : `Drawer ${String(group.drawer).padStart(drawerPadLength, '0')}`} · {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
          </AppPageSubtitle>
          <AppItemList className="mb-0" items={group.items} />
        </section>
      ))}
    </div>
  )
}
