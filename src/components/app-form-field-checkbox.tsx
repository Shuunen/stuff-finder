import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { useCallback } from 'preact/hooks'
import type { FormFieldCheckbox } from '../utils/forms.utils'

type Properties = Readonly<{
  field: FormFieldCheckbox
  id: string
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  updateField: (field: string, target: EventTarget | null, updateField?: boolean) => void
}>

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
export function AppFormFieldCheckbox ({ field, id, updateField }: Properties) {

  const onChange = useCallback((event: Event) => { updateField(id, event.target) }, [id, updateField])

  function checkboxControl (isChecked: boolean | string) { return <Checkbox checked={Boolean(isChecked)} /> }

  return <FormControlLabel
    control={checkboxControl(field.value)}
    id={id}
    label={field.label}
    onChange={onChange}
    required={field.isRequired}
  />
}
