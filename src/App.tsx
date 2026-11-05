import { ThemeProvider } from "styled-components"
import GlobalStyle from "./components/GlobalStyles"
import AppHeader from "./components/AppHeader"
import PageContainer from "./components/PageContainer"
import DeviceList from "./components/DeviceList"
import { GqlProvider } from "./lib/gql"
import { TenantProvider } from "./lib/tenant"
import { theme } from "./theme"

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GqlProvider>
        <TenantProvider>
          <GlobalStyle />
          <AppHeader />
          <PageContainer>
            <DeviceList />
          </PageContainer>
        </TenantProvider>
      </GqlProvider>
    </ThemeProvider>
  )
}

export default App
