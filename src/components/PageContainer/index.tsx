import type { ReactNode } from 'react'

import * as S from './styles'

function PageContainer({ children }: { children: ReactNode }) {
  return <S.Container>{children}</S.Container>
}

export default PageContainer
