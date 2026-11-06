import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  oxc: {
    plugins: {
      styledComponents: {
        // Every component's styles live in styles.ts, so name them after the folder.
        meaninglessFileNames: ['index', 'styles'],
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
  },
})
