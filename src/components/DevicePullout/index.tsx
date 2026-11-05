import { useId, type KeyboardEvent, type Ref } from 'react'

import * as S from './styles'

type DevicePulloutProps = {
  deviceId: string
  onClose: () => void
  ref?: Ref<HTMLElement>
}

function DevicePullout({ deviceId, onClose, ref }: DevicePulloutProps) {
  const titleId = useId()

  // Handled here rather than on the document, so Esc in the tenant dropdown can't also close the panel.
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') onClose()
  }

  return (
    <S.Panel ref={ref} tabIndex={-1} aria-labelledby={titleId} onKeyDown={handleKeyDown}>
      <S.Header>
        <S.Title id={titleId}>{deviceId}</S.Title>
        <S.CloseButton type="button" onClick={onClose}>
          Close
        </S.CloseButton>
      </S.Header>
    </S.Panel>
  )
}

export default DevicePullout
