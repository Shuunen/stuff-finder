// oxlint-disable no-magic-numbers
import { createTheme, type ThemeOptions } from '@mui/material/styles'

const themeOptions: ThemeOptions = {
  components: {
    MuiButton: {
      variants: [
        {
          props: { variant: 'outlined' },
          style: {
            '&:hover': {
              boxShadow: '1px 1px 0 var(--color-black)',
              transform: 'translate(1px, 1px)',
            },
            background: 'var(--color-white)',
            borderColor: 'var(--color-black)',
            borderRadius: '12px',
            borderWidth: '2px',
            boxShadow: '3px 3px 0 var(--color-black)',
            color: 'var(--color-black)',
            fontWeight: 'bold',
            lineHeight: 1.5,
            padding: '6px 16px',
            transition: 'all 0.1s ease-in-out',
          },
        },
      ],
    },
  },
  typography: {
    fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
  },
}

export const theme = createTheme(themeOptions)

/**
 * Get the grid class for the number of columns
 * @param columns the number of columns
 * @returns the grid class
 */
export function gridClass(columns = 1) {
  if (columns === 2) return 'md:grid-cols-2'
  if (columns === 3) return 'md:grid-cols-3'
  if (columns === 4) return 'md:grid-cols-4'
  if (columns === 5) return 'md:grid-cols-5'
  if (columns === 6) return 'md:grid-cols-6'
  if (columns === 7) return 'md:grid-cols-7'
  if (columns === 8) return 'md:grid-cols-8'
  if (columns === 9) return 'md:grid-cols-9'
  if (columns === 10) return 'md:grid-cols-10'
  return 'md:grid-cols-1'
}

/**
 * Get the column span class
 * @param columns the number of columns
 * @returns the column span class
 */
export function colSpanClass(columns: number) {
  if (columns === 2) return 'md:col-span-2'
  if (columns === 3) return 'md:col-span-3'
  if (columns === 4) return 'md:col-span-4'
  if (columns === 5) return 'md:col-span-5'
  if (columns === 6) return 'md:col-span-6'
  if (columns === 7) return 'md:col-span-7'
  if (columns === 8) return 'md:col-span-8'
  if (columns === 9) return 'md:col-span-9'
  if (columns === 10) return 'md:col-span-10'
  return 'md:col-span-1'
}
