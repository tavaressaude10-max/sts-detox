# Routes

This delivery uses TanStack Router in a Vite SPA. Its route files came from
TanStack Start, but the current `vite.hostinger.config.ts` does not configure
automatic route-tree generation. The tracked `src/routeTree.gen.ts` registers
the existing `/` and `/livros` routes. Adding a route requires updating the
registry safely or setting up the appropriate Router generator first.
Do not create Next.js route conventions here. Preserve the root Outlet in
`src/routes/__root.tsx`.

## Conventions

| File | URL |
| --- | --- |
| `index.tsx` | `/` |
| `about.tsx` | `/about` |
| `users/index.tsx` | `/users` |
| `users/$id.tsx` | `/users/:id` (dynamic — bare `$`, no curly braces) |
| `posts/{-$category}.tsx` | `/posts/:category?` (optional segment) |
| `files/$.tsx` | `/files/*` (splat — read via `_splat` param, never `*`) |
| `_layout.tsx` | layout route (renders children via `<Outlet />`) |
| `__root.tsx` | app shell — wraps every page; preserve `<Outlet />` |

`routeTree.gen.ts` originated as a generated file and is tracked in this export.
Do not assume a new file will be registered automatically by the current build.
