import { CircularProgress, Fade } from '@mui/material'

export function AppLoader ({ isLoading }: { isLoading: boolean }) {
  return (
    <Fade in={isLoading}>
      <div class="flex flex-col items-center justify-center fixed top-0 left-0 w-full h-full bg-white/50">
        <CircularProgress size={50} />
      </div>
    </Fade>
  )
}
