import styled from "styled-components"
import GlobalStyle from "./components/GlobalStyles"

const Title = styled.h1`
  color: orange;
`

function App() {
  // This is the root component

  return (
    <>
      <GlobalStyle />
      <Title>This is the homepage</Title>
    </>
  )
}1. 

export default App
