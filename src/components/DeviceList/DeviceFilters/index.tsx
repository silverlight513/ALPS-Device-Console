import { useEffect, useRef, useState, type ChangeEvent } from 'react'

import { DEVICE_STATES } from '@/lib/gql/queries/listDevices'
import * as S from './styles'

const SEARCH_DEBOUNCE_MS = 300

type DeviceFiltersProps = {
  stateId: number | undefined
  onSearchChange: (term: string) => void
  onStateChange: (stateId: number | undefined) => void
}

function DeviceFilters({ stateId, onSearchChange, onStateChange }: DeviceFiltersProps) {
  const [searchInput, setSearchInput] = useState('')
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(debounceTimer.current), [])

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setSearchInput(value)
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => onSearchChange(value.trim()), SEARCH_DEBOUNCE_MS)
  }

  const handleStateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target
    onStateChange(value ? Number(value) : undefined)
  }

  return (
    <S.Filters>
      <S.Field>
        Search
        <S.SearchInput
          type="search"
          placeholder="Serial number or IMEI"
          value={searchInput}
          onChange={handleSearchChange}
        />
      </S.Field>
      <S.Field>
        State
        <S.Select value={stateId ?? ''} onChange={handleStateChange}>
          <option value="">All states</option>
          {DEVICE_STATES.map((state) => (
            <option key={state.id} value={state.id}>
              {state.name}
            </option>
          ))}
        </S.Select>
      </S.Field>
    </S.Filters>
  )
}

export default DeviceFilters
