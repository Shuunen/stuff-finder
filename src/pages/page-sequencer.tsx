/* eslint-disable react/no-multi-comp */

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteIcon from '@mui/icons-material/Delete'
import PlayCircleFilledWhiteOutlinedIcon from '@mui/icons-material/PlayCircleFilledWhiteOutlined'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Slider from '@mui/material/Slider'
import { useSignalEffect } from '@preact/signals'
import { useEffect, useState } from 'preact/hooks'
import { copyToClipboard, debounce } from 'shuutils'
import { AppPageCard } from '../components/app-page-card'
import { delays } from '../constants'
import { logger } from '../utils/logger.utils'
import { playSequence, sequences, type Sequence, type SequenceItem, type SequenceItemTone, type SequenceItemWait } from '../utils/sound.utils'
import { state } from '../utils/state.utils'

const ranges = {
  toneDelay: { max: 3000, min: 25 },
  toneValue: { max: 3000, min: 50 },
  waitDelay: { max: 1000, min: 25 },
}

function copySequence (sequence: Sequence) {
  logger.debug('copySequence', { sequence })
  void copyToClipboard(JSON.stringify(sequence))
  state.message = { content: 'Sequence copied to clipboard', delay: delays.second, type: 'success' }
}

const playSequenceDebounced = debounce(playSequence, delays.medium)

function AppSequenceItemTone ({ index, item, onChange }: { readonly index: number; readonly item: SequenceItemTone; readonly onChange: (event: Event, value: number[] | number, index: number, type: 'tone-delay' | 'tone-value' | 'wait-delay') => void }) {
  return <>
    <div className="flex w-2/3">
      <Slider max={ranges.toneValue.max} min={ranges.toneValue.min} onChange={(event, value) => onChange(event, value, index, 'tone-value')} step={ranges.toneValue.min} value={item[0]} />
    </div>
    <div className="flex w-1/3">
      <Slider max={ranges.toneDelay.max} min={ranges.toneDelay.min} onChange={(event, value) => onChange(event, value, index, 'tone-delay')} step={ranges.toneDelay.min} value={item[1]} />
    </div>
  </>
}

function AppSequenceItemWait ({ index, item, onChange }: { readonly index: number; readonly item: SequenceItemWait; readonly onChange: (event: Event, value: number[] | number, index: number, type: 'tone-delay' | 'tone-value' | 'wait-delay') => void }) {
  return <>
    <div className="flex w-2/3" />
    <div className="flex w-1/3">
      <Slider max={ranges.waitDelay.max} min={ranges.waitDelay.min} onChange={(event, value) => onChange(event, value, index, 'wait-delay')} step={ranges.waitDelay.min} value={item} />
    </div>
  </>
}

function AppSequenceItem ({ index, item, onChange, onDelete }: { readonly index: number; readonly item: SequenceItem; readonly onChange: (event: Event, value: number[] | number, index: number, type: 'tone-delay' | 'tone-value' | 'wait-delay') => void; readonly onDelete: (index: number) => void }) {
  const id = `${typeof item === 'number' ? 'W' : 'T'}${index}`
  const label = typeof item === 'number' ? `Wait for ${item}ms` : `Tone ${item[0]}Hz for ${item[1]}ms`
  const isEven = index % 2 === 0 // eslint-disable-line @typescript-eslint/no-magic-numbers
  return (
    <div className={`flex w-full px-3 transition-colors ${isEven ? 'bg-slate-50 hover:bg-purple-100' : 'bg-slate-200 hover:bg-purple-200'}`}>
      <p className="font-mono">{id}</p>
      <p className="w-1/3">{label}</p>
      {typeof item === 'number' && <AppSequenceItemWait index={index} item={item} onChange={onChange} />}
      {typeof item !== 'number' && <AppSequenceItemTone index={index} item={item} onChange={onChange} />}{/* @ts-expect-error typings issue */}
      <IconButton aria-label="delete" onClick={() => onDelete(index)}><DeleteIcon /></IconButton>
      <p className="font-mono">{id}</p>
    </div>
  )
}

export function PageSequencer ({ ...properties }: { readonly [key: string]: unknown }) {

  const [sequence, setSequence] = useState<Sequence>(sequences.success)

  function onChange (_event: Event, value: number[] | number, index: number, type: 'tone-delay' | 'tone-value' | 'wait-delay') { // eslint-disable-line no-underscore-dangle, @typescript-eslint/naming-convention, @typescript-eslint/max-params, sonarjs/cognitive-complexity
    if (typeof value !== 'number') throw new Error('Weird case where value is not a number')
    if (type === 'wait-delay') setSequence(sequence.map((item, itemIndex) => (itemIndex === index ? value : item))) /* @ts-expect-error typings issue */
    else if (type === 'tone-delay') setSequence(sequence.map((item, itemIndex) => (itemIndex === index ? [item[0], value] : item))) /* @ts-expect-error typings issue */
    else setSequence(sequence.map((item, itemIndex) => (itemIndex === index ? [value, item[1]] : item)))
  }

  function onDelete (index: number) {
    logger.debug('onDelete', { index })
    setSequence(sequence.filter((_item, itemIndex) => itemIndex !== index)) // eslint-disable-line no-underscore-dangle, @typescript-eslint/naming-convention
  }

  useEffect(() => { void playSequenceDebounced(sequence) }, [sequence])
  useSignalEffect(() => { logger.debug('PageSequencer mount', { properties: Object.keys(properties) }) })

  return (
    <AppPageCard cardTitle="Sequencer" icon={AddCircleOutlineIcon} pageCode="sequencer" pageTitle="Sequencer">
      <div className="flex w-[50rem] flex-col">
        <form className="max-h-[19rem] w-full overflow-auto whitespace-nowrap">{/* eslint-disable-next-line react/no-array-index-key */}
          {sequence.map((item, index) => <AppSequenceItem index={index} item={item} key={`${typeof item === 'number' ? 'wait' : 'tone'}-${index}`} onChange={onChange} onDelete={onDelete} />)}
        </form>
        <div className="flex w-full">{/* @ts-expect-error typings issue */}
          <Button onClick={() => setSequence(sequences.success)} startIcon={<RestartAltIcon />} variant="outlined">Reset</Button>
          <div className="grow" />
          <Button onClick={() => setSequence([...sequence, delays.small])} variant="outlined">Add wait</Button>{/* @ts-expect-error typings issue */ /* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <Button onClick={async () => await playSequence(sequence)} startIcon={<PlayCircleFilledWhiteOutlinedIcon />} variant="contained">Play</Button>{/* eslint-disable-next-line @typescript-eslint/no-magic-numbers */}
          <Button onClick={() => setSequence([...sequence, [delays.small, delays.large * 2]])} variant="outlined">Add tone</Button>
          <div className="grow" />{/* @ts-expect-error typings issue */}
          <Button endIcon={<ContentCopyIcon />} onClick={() => copySequence(sequence)} variant="outlined">Copy</Button>
        </div>
      </div>
    </AppPageCard>
  )
}
