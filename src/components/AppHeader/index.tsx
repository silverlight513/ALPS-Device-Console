import TenantSelector from './TenantSelector'
import * as S from './styles';

function AppHeader() {
  return (
    <S.Header>
      <S.Inner>
        <S.Title>ALPS Device Console</S.Title>
        <TenantSelector />
      </S.Inner>
    </S.Header>
  )
}

export default AppHeader
