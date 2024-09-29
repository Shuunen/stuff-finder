import CircularProgress from '@mui/material/CircularProgress'
import Fade from '@mui/material/Fade'

export function AppLoader ({ isLoading }: Readonly<{ isLoading: boolean }>) {
  return (
    <Fade in={isLoading}>
      <div class="fixed left-0 top-0 z-50 flex size-full flex-col bg-white/50" data-component="loader">
        <CircularProgress size={50} />
      </div>
    </Fade>
  )
}
