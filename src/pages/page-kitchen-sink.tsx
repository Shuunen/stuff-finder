import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import type { JSX } from 'react'
import { AppBarcode } from '../components/app-barcode'
import { AppButton } from '../components/app-button'
import { AppPill } from '../components/app-pill'
import type { Item } from '../types/item.types'
import { emptyItem } from '../utils/item.utils'

const isHighlighted = false
const size = '40x20'
const items = [
  { ...emptyItem, name: 'ok without resize', reference: '123' },
  { ...emptyItem, name: 'ok without resize', reference: '123456' },
  { ...emptyItem, name: 'ok without resize', reference: '123456789012' },
  { ...emptyItem, name: 'ok without resize', reference: '12345678901234567890' },
  { ...emptyItem, name: 'NOK without resize', reference: '12345678901234567890!' },
  { ...emptyItem, name: 'ok resized to 2', reference: '12345678901234567890!' },
  { ...emptyItem, name: 'ok without resize', reference: 'le chat de feu' },
  { ...emptyItem, name: 'NOK without resize', reference: 'le chat de feu vert' },
  { ...emptyItem, name: 'ok resized to 2', reference: 'le chat de feu vert' },
  {
    ...emptyItem,
    box: 'Red' as Item['box'],
    brand: '3 chars box name',
    drawer: 3,
    name: 'This is a box test',
    reference: '12345678901234567890wq',
  },
  {
    ...emptyItem,
    box: 'Blue',
    brand: '4 chars box name',
    drawer: 4,
    name: 'This is a box test',
    reference: '12345678901234567890wq',
  },
  {
    ...emptyItem,
    box: 'Green',
    brand: '5 chars box name',
    drawer: 5,
    name: 'This is a box test',
    reference: '12345678901234567890wq',
  },
  {
    ...emptyItem,
    box: 'Yellow',
    brand: '6 chars box name',
    drawer: 6,
    name: 'This is a box test',
    reference: '12345678901234567890wq',
  },
] satisfies Item[]

const colorPalette = [
  { name: 'red', token: '--color-red' },
  { name: 'white', token: '--color-white' },
  { name: 'cream', token: '--color-cream' },
  { name: 'slate', token: '--color-slate' },
  { name: 'black', token: '--color-black' },
  { name: 'amber', token: '--color-amber' },
  { name: 'mint', token: '--color-mint' },
  { name: 'sky', token: '--color-sky' },
  { name: 'pink', token: '--color-pink' },
  { name: 'peach', token: '--color-peach' },
  { name: 'violet', token: '--color-violet' },
]

const semanticPalette = [
  { alias: 'white', name: 'white', token: '--color-white', uses: 25 },
  { alias: 'black', name: 'black', token: '--color-black', uses: 68 },
  { alias: 'slate', name: 'grey', token: '--color-grey', uses: 18 },
  { alias: 'cream', name: 'background', token: '--color-background', uses: 30 },
  { alias: 'red', name: 'primary', token: '--color-primary', uses: 18 },
  { alias: 'amber', name: 'pastel-1', token: '--color-pastel-1', uses: 8 },
  { alias: 'mint', name: 'pastel-2', token: '--color-pastel-2', uses: 3 },
  { alias: 'sky', name: 'pastel-3', token: '--color-pastel-3', uses: 3 },
  { alias: 'pink', name: 'pastel-4', token: '--color-pastel-4', uses: 2 },
  { alias: 'peach', name: 'pastel-5', token: '--color-pastel-5', uses: 3 },
  { alias: 'violet', name: 'pastel-6', token: '--color-pastel-6', uses: 3 },
]

const paletteRows = colorPalette.map(color => {
  const semantic = semanticPalette.find(entry => entry.alias === color.name)
  return {
    name: color.name,
    semantic: semantic?.name,
    semanticUses: semantic?.uses,
    token: color.token,
  }
})

function paletteTable() {
  return (
    <table className="w-full border-collapse">
      <tbody>
        {paletteRows.map(row => (
          <tr className="border-b border-grey/10" key={row.name}>
            <td className="w-16 py-2 pr-4">
              <AppPill className="size-16 rounded border-2 border-grey" background={`var(${row.token})`} />
            </td>
            <td className="py-2">
              <span className="font-display text-sm font-bold text-black">{row.name}</span>
              {row.semantic !== undefined && (
                <span className="ml-3 font-mono">
                  → {row.semantic}
                  <span className="ml-2 text-grey" title="number of uses in the codebase">
                    ({row.semanticUses})
                  </span>
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const buttonColors = ['white', 'primary', 'pastel-1', 'pastel-2', 'pastel-3', 'pastel-4', 'pastel-5', 'pastel-6'] as const

function buttonsSection() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <small>outlined (default)</small>
        <div className="flex flex-wrap gap-3">
          {buttonColors.map(color => (
            <AppButton key={color} color={color} label={color} name={`outlined-${color}`} variant="outlined" />
          ))}
        </div>
      </div>
      <div>
        <small>text</small>
        <div className="flex flex-wrap gap-3">
          {buttonColors.map(color => (
            <AppButton key={color} color={color} label={color} name={`text-${color}`} variant="text" />
          ))}
        </div>
      </div>
      <div>
        <small>disabled</small>
        <div className="flex flex-wrap gap-3">
          <AppButton disabled label="outlined disabled" name="disabled-outlined" variant="outlined" />
          <AppButton disabled label="text disabled" name="disabled-text" variant="text" />
        </div>
      </div>
      <div>
        <small>with icon</small>
        <div className="flex flex-wrap gap-3">
          <AppButton label="Back" name="icon-start" startIcon={<ChevronLeftIcon />} />
          <AppButton label="Next" name="icon-end" endIcon={<ChevronLeftIcon style={{ transform: 'rotate(180deg)' }} />} color="pastel-3" />
        </div>
      </div>
      <div>
        <small>loading</small>
        <div className="flex flex-wrap gap-3">
          <AppButton label="Loading" loading name="loading" />
          <AppButton label="Loading primary" loading name="loading-primary" color="primary" />
        </div>
      </div>
    </div>
  )
}

const typeScale = [
  { label: 'h1 — Level one title', sample: 'Stuff Finder', tag: 'h1' },
  { label: 'h2 — Level two title', sample: 'Where did I put it?', tag: 'h2' },
  { label: 'h3 — Level three title', sample: 'Settings', tag: 'h3' },
  // { label: 'h4 — Level four title', sample: 'Search across all your boxes and drawers.', tag: 'h4' },
  { label: 'p — Paragraph', sample: 'Last updated 3 minutes ago', tag: 'p' },
  { label: 'em — Emphasized text', sample: 'BRAND · LOCATION', tag: 'em' },
  { label: 'small — Small text', sample: 'Small informative text', tag: 'small' },
]

function typographyTable() {
  return (
    <div className="flex flex-col gap-6">
      {typeScale.map(row => (
        <div className="flex items-center gap-6 border-b border-grey/20 pb-4" key={row.label}>
          <span className="w-64 shrink-0 font-mono text-xs text-grey">{row.label}</span>
          {(() => {
            const Tag = row.tag as keyof JSX.IntrinsicElements
            return <Tag>{row.sample}</Tag>
          })()}
        </div>
      ))}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <h2>{title}</h2>
      {children}
      <div className="mx-auto my-8 w-1/2 border-b-4 border-primary/20" />
    </div>
  )
}

// oxlint-disable-next-line react/no-multi-comp
export function PageKitchenSink() {
  return (
    <div className="flex h-screen flex-col gap-10 p-12" data-page="kitchen-sink">
      <h1>Kitchen Sink</h1>
      <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto">
        <Section title="Typography">{typographyTable()}</Section>

        <Section title="Colors">{paletteTable()}</Section>

        <Section title="Buttons">{buttonsSection()}</Section>

        <Section title="Barcodes">
          <div className="grid w-3/4 grid-cols-3 gap-6">
            {items.map(item => (
              <div className="flex flex-col items-start gap-0" key={item.reference + item.name}>
                <AppBarcode isHighlighted={isHighlighted} item={item} size={size} willResize={!item.name.includes('NOK')} />
                <p className="mt-1 font-mono text-xs break-all">
                  reference : {item.reference}
                  <br />
                  length : {item.reference.length}
                  <br />
                  {/* oxlint-disable-next-line no-magic-numbers */}
                  size : {item.name.includes('resized') ? 2 : 3}
                </p>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}
