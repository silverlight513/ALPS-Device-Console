import { cleanup } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll } from 'vitest'

/**
 * No default handlers: each test stubs exactly the operations it uses with `server.use`, so its
 * responses and their timing are written in the test rather than taken from the jittery mock.
 */
export const server = setupServer()

// A request the test didn't stub fails loudly instead of hanging until the timeout.
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())
