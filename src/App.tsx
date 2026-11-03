import GlobalStyle from "./components/GlobalStyles"
import AppHeader from "./components/AppHeader"
import DeviceList from "./components/DeviceList"
import { GqlProvider } from "./lib/gql"
import { TenantProvider } from "./lib/tenant"

function App() {
  return (
    <GqlProvider>
      <TenantProvider>
        <GlobalStyle />
        <AppHeader />
        <DeviceList />
      </TenantProvider>
    </GqlProvider>
  )
}

export default App
