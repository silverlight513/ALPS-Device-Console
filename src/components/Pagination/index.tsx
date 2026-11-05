import * as S from './styles'

type PaginationProps = {
  page: number
  /** Undefined means the total isn't known yet, so the page count can't be stated. */
  totalCount: number | undefined
  pageSize: number
  onPageChange: (page: number) => void
  label?: string
}

function Pagination({ page, totalCount, pageSize, onPageChange, label = 'Pagination' }: PaginationProps) {
  const isTotalUnknown = totalCount === undefined
  const totalPages = Math.max(1, Math.ceil((totalCount ?? 0) / pageSize))
  const firstResult = (page - 1) * pageSize + 1
  const lastResult = Math.min(page * pageSize, totalCount ?? 0)

  return (
    <S.Nav aria-label={label} $dimmed={isTotalUnknown}>
      <S.Controls>
        <S.Button type="button" disabled={isTotalUnknown || page <= 1} onClick={() => onPageChange(page - 1)}>
          ‹ Prev
        </S.Button>
        <span>
          {isTotalUnknown ? 'Page - of -' : `Page ${page} of ${totalPages}`}
        </span>
        <S.Button type="button" disabled={isTotalUnknown || page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next ›
        </S.Button>
      </S.Controls>
      {!isTotalUnknown && totalCount > 0 && (
        <S.Summary>
          Showing {firstResult}–{lastResult} of {totalCount}
        </S.Summary>
      )}
    </S.Nav>
  )
}

export default Pagination
