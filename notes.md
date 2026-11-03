## Questions for hiring company

1. Why are you using a custom GQL library in your app instead of a well tested and maintained package? What was the cost/benefit analysis results with that discussion. A lot of the problems mentioned that need solving in the tech test around the fetching/storing/handling of data are solved problems with packages like apollo/urql/tanstack.



## Notes on tech test

1. Missing `npm install -D graphql` in setup steps. msw throws an error if it's not been installed.

2. Handlers.ts from appendix throws error on first load. I'm guessing msw has released newer versions since this test was written. It no longer exports graphql at the top level as a named export. Added example mock git diff of change required. 

```
- import { HttpResponse, graphql } from 'msw';
-----------
+ import { HttpResponse } from 'msw';
+ import { graphql } from 'msw/graphql';
```