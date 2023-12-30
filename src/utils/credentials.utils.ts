import type { AppCredentials } from '../types'

export function parseClipboard (clipboard: string) {
  // clipboard should contains something like : "appABC
  // patXYZ.123
  // my-table
  // my-view
  // azerty4567"
  const regex = /"(?<base>app\w+)\n(?<token>pat[\w.]+)\n(?<table>[\w-]+)\n(?<view>[\w-]+)\n(?<wrap>[\w-]+)"/u
  const { base = '', table = '', token = '', view = '', wrap = '' } = regex.exec(clipboard)?.groups ?? {}
  return { base, table, token, view, wrap } satisfies AppCredentials
}
