import * as S from './styles'

type PaginationProps = {
  page: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
  label?: string
  disabled?: boolean
}

function Pagination({ page, totalCount, pageSize, onPageChange, label = 'Pagination', disabled = false }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const firstResult = (page - 1) * pageSize + 1
  const lastResult = Math.min(page * pageSize, totalCount)

  return (
    <S.Nav aria-label={label} $dimmed={disabled}>
      <S.Controls>
        <S.Button type="button" disabled={disabled || page <= 1} onClick={() => onPageChange(page - 1)}>
          ‹ Prev
        </S.Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <S.Button type="button" disabled={disabled || page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next ›
        </S.Button>
      </S.Controls>
      {totalCount > 0 && (
        <S.Summary>
          Showing {firstResult}–{lastResult} of {totalCount}
        </S.Summary>
      )}
    </S.Nav>
  )
}

export default Pagination
