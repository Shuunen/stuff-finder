import CircularProgress from '@mui/material/CircularProgress'
import Fade from '@mui/material/Fade'

export function AppLoader ({ isLoading }: { readonly isLoading: boolean }) {
  return (
    <Fade in={isLoading}>
      <div className="fixed left-0 top-0 flex h-full w-full flex-col items-center justify-center bg-white/50" data-component="loader">
        <CircularProgress size={50} />
      </div>
    </Fade>
  )
}
