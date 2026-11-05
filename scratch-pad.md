## Questions for hiring company

1. Why are you using a custom GQL library in your app instead of a well tested and maintained package? What was the cost/benefit analysis results with that discussion. A lot of the problems mentioned that need solving in the tech test around the fetching/storing/handling of data are solved problems with packages like apollo/urql/tanstack.

## Notes 

1. `useTenantQuery` / `useTenantMutation` are the thin wrappers the spec asks for. They read `tenantId` from `TenantContext` and inject it into every operation, including `refetch` and `mutateData` called with `replace: true`, so no call site passes it. Reading and changing the current tenant is a separate hook: `const { tenantId, setTenantId } = useTenant()`.

2. The theming and design work. I'm aware it said that "visual polish" is explicitly out of scope. I chose to spin up a quick theme and simple design so that I could test the project easier and find anything missing that shouldn't be missing. Without any sort of visual polish, the project would have been more difficult to manually test. It also took very little time to put the theme together. If it took a significant portion of the time alloted, I would have obviously kept stricter to the requirements.

3. Known wart: `load()` clears `errors` while revalidating. Reopening `SN-0000-POISON` after its entry is cached briefly shows the "Unavailable" fields without the warning banner, until the new response lands. I accepted this rather than change the store for a cosmetic flicker.

## Feedback on tech test

1. Missing `npm install -D graphql` in setup steps. msw throws an error if it's not been installed.

2. Handlers.ts from appendix throws error on first load. I'm guessing msw has released newer versions since this test was written. It no longer exports graphql at the top level as a named export. Added example mock git diff of change required. 

```
- import { HttpResponse, graphql } from 'msw';
-----------
+ import { HttpResponse } from 'msw';
+ import { graphql } from 'msw/graphql';
```

3. main.tsx code from the appendix also threw errors. Again, I'm guessing msw has been updated since this was written. Added a git diff example:

```
- return worker.start({ onUnhandledRequest: 'bypass' });
-----------
+ return worker.start({ onUnhandledFrame: 'bypass' }) ;
```