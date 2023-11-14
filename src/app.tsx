/* eslint-disable jsx-a11y/no-autofocus, react/no-unknown-property, react-form-fields/no-only-value-prop */

import { AppPrompter } from './components/app-prompter'
import { AppSpeedDial } from './components/app-speed-dial'

export function App () {

  return (
    <>
      {/* good code */}
      <AppPrompter />
      <AppSpeedDial />
      {/* old code to migrate */}
      <app-toaster />
      <app-loader />
      <app-scan-code />
      <app-search-button />
      <app-print-barcodes />
      <app-print-one />
      <app-settings-trigger />
      <app-modal class="hidden px-2 md:max-h-[max(30rem,50vh)]" data-title="Search results" name="search-results">
        <div className="app-list app-results overflow-auto" />
      </app-modal>
      <app-modal class="hidden" data-title="Edit item" name="edit-item">
        <div className="content overflow-auto" />
      </app-modal>
      <app-modal class="hidden" data-title="Add item" name="add-item">
        <div className="content overflow-auto">
          <app-form allow-submit class="justify-center" hide-actions-on-submit inline="true" name="search-item" no-hid save="app-search-item"
            save-label="Search">
            <label>Search online by name or reference : <input autoFocus maxLength={150} minLength={3} name="input" type="text" /></label>
          </app-form>
          <div className="mx-auto mb-4 mt-5 w-1/2 border-b-2" />
        </div>
      </app-modal>
      <app-edit-item />
      <app-modal class="hidden" data-title="Settings" name="settings">
        <app-form class="md:grid-cols-1" close="app-modal--settings--close" name="settings">
          <label>
            <a href="https://airtable.com/api" rel="noreferrer" target="_blank">Airtable api base</a>
            <input autoFocus multi-paste name="base" pattern="^app\w{14}$" placeholder="your api base" required type="text" />
          </label>
          <label>
            <a href="https://airtable.com/account" rel="noreferrer" target="_blank">Airtable api key</a>
            <input maxLength={17} name="key" pattern="^key\w{14}$" placeholder="your api key" required type="text" />
          </label>
          <label>
            Airtable table name
            <input name="table" pattern="\S+" placeholder="your table name" required type="text" value="stuff-finder" />
          </label>
          <label>
            Airtable view name
            <input name="view" pattern="\S+" placeholder="your table name" required type="text" value="stuff-finder" />
          </label>
          <label>
            <a href="https://wrapapi.com/user/api" rel="noreferrer" target="_blank">Wrap Api key (optional)</a>
            <input maxLength={32} name="wrap" pattern="\w{32}" placeholder="your wrap api key" type="text" />
          </label>

          <details>
            <summary>What this app do with my credentials ?</summary>
            <small>
              <ul className="mb-2 list-inside list-disc">
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
            <summary>Advanced features</summary>
            <small>
              <div className="flex gap-4">
                <button data-action="app-clear-cache" type="button">Clear cache</button>
                <button data-action="app-clear-credentials" type="button">Clear credentials</button>
              </div>
            </small>
          </details>

          <details>
            <summary>About this app</summary>
            <small>
              This is an open source project from <a data-action="see-profile" href="https://github.com/Shuunen" rel="noreferrer"
                target="_blank">Shuunen</a>.<br />You can
              check the
              source code on the <a data-action="see-project" href="https://github.com/Shuunen/stuff-finder" rel="noreferrer" target="_blank">Github
                project page</a>.
              <br />
              <span id="unique-mark" />
            </small>
          </details>

        </app-form>
      </app-modal>
      <app-modal class="hidden" data-title="Print items" name="prepare-barcodes">
        <p className="font-medium text-yellow-700 sm:hidden">This content is too small for a mobile device, please use a bigger screen to access the barcode
          printing feature.</p>
        <div className="m-2 hidden items-baseline gap-2 sm:flex">
          <p>This is the list of items that have (supposedly) no printed reference on it.</p>
        </div>
        <div className="app-list hidden sm:block" />
      </app-modal>
      <app-modal class="hidden" data-title="Print Barcodes" name="print-barcodes">
        <p>
          Below is a preview of the page that will be printed. <br />
          Make sure to remove any print margin in the <a data-action="barcodes-print" href="#print">print modal</a>.
        </p>
        <div className="app-print-zone app-preview">
          <div className="app-barcodes app-a4-65" />
        </div>
      </app-modal>
      <app-modal class="hidden" data-title="Print item reference" name="print-one">
        <div className="app-print-one--preview mx-auto mb-4" />
        <app-form cancel-label="Close" class="mb-4" close="app-modal--print-one--close" keep-save-active name="print-one" save="do-print-one"
          save-label="Print">
          <label>
            Print size ?
            <select name="size">
              <option value="40x30">40mm x 30mm</option>
              <option selected value="40x20">40mm x 20mm</option>
            </select>
          </label>
        </app-form>
      </app-modal>
      <app-search-results />
    </>
  )
}
