## Questions for hiring company

1. Why are you using a custom GQL library in your app instead of a well tested and maintained package? What was the cost/benefit analysis results with that discussion. A lot of the problems mentioned that need solving in the tech test around the fetching/storing/handling of data are solved problems with packages like apollo/urql/tanstack.

## Notes 

1. `useTenantQuery` / `useTenantMutation` are the thin wrappers the spec asks for. They read `tenantId` from `TenantContext` and inject it into every operation, including `refetch` and `mutateData` called with `replace: true`, so no call site passes it. Reading and changing the current tenant is a separate hook: `const { tenantId, setTenantId } = useTenant()`.

2. The theming and design work. I'm aware it said that "visual polish" is explicitly out of scope. I chose to spin up a quick theme and simple design so that I could test the project easier and find anything missing that shouldn't be missing. Without any sort of visual polish, the project would have been more difficult to manually test. It also took very little time to put the theme together. If it took a significant portion of the time alloted, I would have obviously kept stricter to the requirements.

3. Search is one box, but `listDevices` ANDs `imei` and `serialNumber`, so sending the term as both matches almost nothing. Two queries can't be merged under server-side pagination. All digits searches IMEI and anything else searches serial. The catch is that a digits-only serial fragment searches IMEIs instead: `0012` misses a serial like `SN-0012-A` (`-0012` finds it) and can return an unrelated device whose IMEI contains those digits. The empty state names the field it searched, but a false match like that has no such hint.

4. A new search or page keeps the previous rows on screen, dimmed, until the response lands. History does the same when changing page, so the panel doesn't collapse and move Next out from under the cursor. This lives in the components rather than `useQuery`, so the hook only ever returns data for its current variables. The rows can't cross tenants because the list remounts per tenant, or cross devices because the pullout remounts per device. Pagination is disabled while a search or filter change is pending, because its total belongs to the old results. It stays live for page changes, so keyboard users don't lose focus on Next. If a search fails, the old rows and total don't come back, because they'd describe results that aren't on screen.

5. A partial response renders everything that resolved. Missing fields show "Unavailable", and a warning names what failed, so a missing value can't be mistaken for an empty one. Dropping the payload because `errors` is non-empty would hide a valid IMEI and state to report a problem with two other fields. A partial response is never treated as fresh, so it refetches on the next mount instead of being cached for the full TTL. If there's no data at all, the panel shows a plain error instead.

6. A reload keeps the entry's previous errors until the response lands, so a warning or error doesn't vanish during a refetch or retry. Each of the three queries has a manual retry button, which stays in place as "Retrying…" so keyboard focus isn't lost. If the retry succeeds and the button goes, focus moves to that section's heading.

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