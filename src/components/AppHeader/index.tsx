import TenantSelector from './TenantSelector'
import * as S from './styles';

function AppHeader() {
  return (
    <S.Header>
      <S.Title>ALPS Device Console</S.Title>
      <TenantSelector />
    </S.Header>
  )
}

export default AppHeader
