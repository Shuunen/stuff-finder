import PestControlIcon from '@mui/icons-material/PestControl'
import { AppPageCard } from '../components/app-page-card'
import { logger } from '../utils/logger.utils'

export function PageError ({ code, ...properties }: Readonly<{ [key: string]: unknown; code?: string }>) {
  logger.debug('PageError', { code, properties })
  return (
    <AppPageCard cardTitle="Error" icon={PestControlIcon} pageCode="error" pageTitle={`Error ${code}`}>
      <div class="flex flex-col">
        <h1>Ow no :(</h1>
        <h2>It seems that a &quot;{code}&quot; error occurred...</h2>
        <p>Is it your fault ? Is it my fault ? Who knows... Does it really matter ? I don&apos;t think so.</p>
        <p class="cursor-help opacity-10 hover:animate-pulse hover:opacity-20">Statically speaking, it&apos;s probably your fault.</p>
      </div>
    </AppPageCard>
  )
}
