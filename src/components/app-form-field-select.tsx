import Autocomplete, { type AutocompleteRenderInputParams } from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import { useCallback } from 'react'
import { type Form, type FormFieldSelect, optionsToLabels } from '../utils/forms.utils'

type Properties = Readonly<{
  field: FormFieldSelect
  form: Form
  id: string
  updateField: (field: string, target: EventTarget | null, updateField?: boolean) => void
}>

export function AppFormFieldSelect({ field, form, id, updateField }: Properties) {
  const onChange = useCallback(
    (event: React.SyntheticEvent) => {
      updateField(id, event.target)
    },
    [id, updateField],
  )

  const renderInput = useCallback(
    (parameters: AutocompleteRenderInputParams) => <TextField {...parameters} error={form.isTouched && !field.isValid} label={field.label} onChange={onChange} required={field.isRequired} value={field.value} variant="standard" />,
    [form.isTouched, field.isValid, field.isRequired, field.label, onChange, field.value],
  )

  const options = optionsToLabels(field.options)

  return <Autocomplete id={id} onChange={onChange} options={options} renderInput={renderInput} value={field.value} />
}
