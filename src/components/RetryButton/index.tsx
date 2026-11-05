import { useLayoutEffect, useRef, type RefObject } from 'react'

import * as S from './styles'

type RetryButtonProps = {
  retrying: boolean
  onRetry: () => void
  /** Takes focus if the button is removed while focused, which is what happens when a retry succeeds. */
  focusAfterRef: RefObject<HTMLElement | null>
}

// Not the `disabled` attribute, because that would drop keyboard focus as soon as a retry starts.
function RetryButton({ retrying, onRetry, focusAfterRef }: RetryButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => {
    const button = buttonRef.current
    const focusAfter = focusAfterRef.current
    return () => {
      if (button === document.activeElement) focusAfter?.focus()
    }
  }, [focusAfterRef])

  return (
    <S.Button
      ref={buttonRef}
      type="button"
      aria-disabled={retrying}
      onClick={() => {
        if (!retrying) onRetry()
      }}
    >
      {retrying ? 'Retrying…' : 'Retry'}
    </S.Button>
  )
}

export default RetryButton
