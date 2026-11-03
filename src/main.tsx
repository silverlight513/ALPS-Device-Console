import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

async function enableMocking() {
  const { worker } = await import('./mocks/browser');
  return worker.start({ onUnhandledRequest: 'bypass' }); // TODO: Figure out why there's a ts error with the code provided here from appendix a.
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
