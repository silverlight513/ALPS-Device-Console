# The race condition

I designed the GQL client lib so that we don't have to be concerned about race conditions coming from the data layer. The hooks (useQuery/useMutation) specifically look up their data based on the given variables they're requesting at any given time. A late response would therefore be left unread as it's no longer relevant to the current render. Responses that are inflight are aborted (after a reset or tenant switch).

# Tenants

As requested, there are two small wrapper hooks to inject the tenantId into the useQuery/Mutation hooks from the tenant context so the tenantId isn't requirerd per call on any component that has to make a network request and reads from a single source of truth so it can never be out of date. An alternative method I would have liked to have tried if we were using apollo client or something similar is a middleware to read the context so that we don't have 2 useQuery hooks and 2 useMutation hooks allowing developers the opportunity to use the wrong one.

The local cache is cleared and all inflight requests are aborted when switching to a different tenant. I chose this option because the spec asked specifically to not show any data from an old tenant when switching. Clearing the cache therefore removes the risk entirely before any data could even reach the visual layer.

# Cache TTL

I chose a 30 second cache. TTLs are always a juggling act between resource/data management and user experience. Sometimes, on a system like this you may want that cache to be incredibly short as you're likely to be in a situation where users could be actioning the same devices causing race conditions if data is displayed incorrectly.

# Optimistic updates

I created an override mechanism that acts almost as local state but extracted. Anything in there matching the current row or pullout will be used instead of the data retrieved from the server. The mutation, when it fails deletes this override enabled a visual rollback. I did think about using the GQL data layer to enact this override and reversing it if the mutation fails but I didn't want to muddy the waters around what is the source of truth for data. This would have also over complicated the caching and race condition solutions of the GQL data layer/store.

# Data + Error

I wholeheartedly agree that data and errors shouldn't override each other. It's one of the masterful parts of GQL over other systems such as REST. You can have both, so why not use both. I'd built the components so that they always render the current data and any errors if they exist. The errors show inline to where they are relevant or as a general error if there is only an error. This gives the user best of both worlds, data when it's available and an understanding of why some data is missing and/or why some actions have failed.

# Cache invalidation

In the current set up, the data store is indexed by queryKey which means the store works off queries instead of individual devices, however, individual devices are updated/maintained in the store. To switch to an entity based model, the store would also have to add an index by ID for every device. Logic to keep the index current on each fetch as two search results can contain the same device but in different states as time progresses. I'd also update the current query index to list what devices are within it so that refetching from cache is still possible. 

# What's next

I built the lib folder specifically so that anything inside it could be pulled out and built into its own module. I don't know from where I am now if that'd be worth the effort but it's an avenue that I've ensured is available. 

I'd definitely want a lot more tests, a single test is no way to build a system. As the system grows, an E2E test suite that can be ran nightly or part of a CI/CD pipeline could catch problems before they reach users and become invaluable if well maintained.

I'd also want to break up the components differently and introduce real component architecture. I don't like stacking components how it's been done here in a single verticle path. It's not extendable and lands you in a component waterfall, ripe for prop drilling. A router would solve some of that issue. Also being able to use query params would reduce the local state and data layer complexity while giving many benefits that were off limits for this project such as persistence across reloads.

The GQL data store/layer needs a lot more work, specifically all of the mentioned parts in the spec i.e. garbage collection, subscriptions and retry with backoffs.

Also better dev tooling, I didn't add anything like prettier to save time but it would have been a lot nicer having it.

