import type {} from '@mui/material/SpeedDialAction'

declare module '@mui/material/SpeedDialAction' {
  interface SpeedDialActionFabSlotPropsOverrides {
    'data-testid'?: string
  }
}
