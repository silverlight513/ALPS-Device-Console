import * as S from './styles'

type PaginationProps = {
  page: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
}

function Pagination({ page, totalCount, pageSize, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize)
  const firstResult = (page - 1) * pageSize + 1
  const lastResult = Math.min(page * pageSize, totalCount)

  return (
    <S.Nav aria-label="Pagination">
      {totalPages > 1 && (
        <S.Controls>
          <S.Button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            ‹ Prev
          </S.Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <S.Button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            Next ›
          </S.Button>
        </S.Controls>
      )}
      <S.Summary>
        Showing {firstResult}–{lastResult} of {totalCount}
      </S.Summary>
    </S.Nav>
  )
}

export default Pagination
