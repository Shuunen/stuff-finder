import Button from '@mui/material/Button'
import { route } from 'preact-router'
import type { CSSProperties } from 'preact/compat'
import { useCallback, useMemo, useState } from 'preact/hooks'
import { AppPrompter } from '../components/app-prompter'
import { AppQuickSearch } from '../components/app-quick-search'
import { setPageTitle } from '../utils/browser.utils'
import { logger } from '../utils/logger.utils'
import { playInfoSound } from '../utils/sound.utils'
import { listenUserSpeech } from '../utils/speech.utils'
import { state, watchState } from '../utils/state.utils'

const triggerColumnClasses = 'flex w-full flex-col gap-3 text-gray-400 transition-colors hover:text-purple-600 duration-400 disabled:opacity-50 disabled:pointer-events-none'
const triggerButtonStyle = { fontSize: '1rem', height: '2.7rem', textTransform: 'none' }

// eslint-disable-next-line max-lines-per-function
export function PageHome ({ ...properties }: Readonly<Record<string, unknown>>) {
  logger.debug('PageHome', { properties })
  setPageTitle('Home')

  const [isUsable, setIsUsable] = useState(state.status !== 'settings-required')
  const ctaStyle = useMemo(() => (isUsable ? {} : { filter: 'grayscale(1)', opacity: 0.5, pointerEvents: 'none' } satisfies CSSProperties), [isUsable])

  watchState('status', () => { setIsUsable(state.status !== 'settings-required') })

  const onSpeech = useCallback(() => {
    state.status = 'listening'
    playInfoSound()
    listenUserSpeech((transcript: string) => {
      logger.showLog(`searching for "${transcript}"`)
      route(`/search/${transcript}`)
    })
  }, [])

  return (
    <div data-page="home">
      {/* new good code */}
      <AppPrompter />
      <div class="grid gap-8 md:grid-cols-3 md:gap-6" style={ctaStyle}>
        <div class={triggerColumnClasses}>
          <Button color="primary" fullWidth href="/scan" sx={triggerButtonStyle} variant="contained">Scan it</Button>
          <svg class="h-8" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><title>Scan icon</title><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2"><path d="M2 10V6h4M30 10V6h-4M2 22v4h4M30 22v4h-4M6 9v6M11 9v6M26 9v6M21 9v6M16 9v6M2 18h28M6 21v2M11 21v1M26 21v2M21 21v1M16 21v1" /></g></svg>
        </div>
        <div class={triggerColumnClasses}>
          <AppQuickSearch placeholder="Type it" />
          <svg class="h-8" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><title>Keyboard icon</title><path d="M108 48H68c12-13-12-27 0-40h-8c-12 13 12 27 0 40H20c-9 0-16 7-16 16v40c0 9 7 16 16 16h88c9 0 16-7 16-16V64c0-9-7-16-16-16zm8 56c0 4-4 8-8 8H20c-4 0-8-4-8-8V64c0-4 4-8 8-8h88c4 0 8 4 8 8v40z" fill="currentColor" /></svg>
        </div>
        <div class={triggerColumnClasses}>
          <Button color="primary" fullWidth onClick={onSpeech} sx={triggerButtonStyle} variant="contained">Speech</Button>
          <svg class="h-8" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><title>Mic icon</title><path d="M108 68a4 4 0 10-8 0 36 36 0 01-72 0 4 4 0 10-8 0c0 23 18 42 40 44v8H40a4 4 0 100 8h48a4 4 0 100-8H68v-8c22-2 40-21 40-44z" fill="currentColor" /><path d="M64 8c11 0 20 9 20 20v40a20 20 0 01-40 0V28c0-11 9-20 20-20m0-8C49 0 36 13 36 28v40a28 28 0 0056 0V28C92 13 79 0 64 0z" fill="currentColor" /></svg>
        </div>
      </div>
      {/* old code to migrate */}
      <app-modal class="hidden" data-title="Add item" name="add-item">
        <div class="overflow-auto">
          <app-form allow-submit class="justify-center" hide-actions-on-submit inline="true" name="search-item" no-hid save="app-search-item"
            save-label="Search">
            <label>Search online by name or reference : <input maxLength={150} minLength={3} name="input" type="text" /></label>
          </app-form>
          <div class="mx-auto mb-4 mt-5 w-1/2 border-b-2" />
        </div>
      </app-modal>
      <app-modal class="hidden" data-title="Settings" name="settings">
        <app-form class="md:grid-cols-1" close="app-modal--settings--close" name="settings">
          <details>
            <summary>What this app do with my credentials ?</summary>
            <small>
              <ul class="mb-2 list-inside list-disc">
                <li>fetch your Airtable data</li>
                <li>store credentials locally in your browser</li>
              </ul>
              Only you can access your data on this browser.<br />
              Feel free to check this app source code on the <a data-action="see-project" href="https://github.com/Shuunen/stuff-finder" rel="noreferrer"
                target="_blank">Github
                project page</a>.
            </small>
          </details>

          <details>
            <summary>What about that Wrap api optional field ?</summary>
            <small>
              Wrap api is a great & <strong>free</strong> service to fetch data, it ease the process to add products to your Airtable database.<br />
              For exemple, <u>give him the EAN code of your product, he will fetch the name and image</u>.<br />
              Check their <a href="https://wrapapi.com" rel="noreferrer" target="_blank">website</a> to register your free account.
            </small>
          </details>

          <details>
            <summary>About this app</summary>
            <small>
              This is an open source project from <a data-action="see-profile" href="https://github.com/Shuunen" rel="noreferrer" target="_blank">Shuunen</a>.<br />
              You can check the source code on the <a data-action="see-project" href="https://github.com/Shuunen/stuff-finder" rel="noreferrer" target="_blank">Github project page</a>.<br />
              <span id="unique-mark">__unique-mark__</span>
            </small>
          </details>
        </app-form>
      </app-modal>
      <app-modal class="hidden" data-title="Print items" name="prepare-barcodes">
        <p class="font-medium text-yellow-700 sm:hidden">This content is too small for a mobile device, please use a bigger screen to access the barcode
          printing feature.</p>
        <div class="m-2 hidden items-baseline gap-2 sm:flex">
          <p>This is the list of items that have (supposedly) no printed reference on it.</p>
        </div>
        <div class="app-list hidden sm:block" />
      </app-modal>
    </div>
  )
}
