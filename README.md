A small Next.js dashboard with an inline-editable products data table backed by a local `json-server` API.

## Setup instructions

Prerequisites: Node 20+, [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev
```

`pnpm dev` runs two processes via `concurrently`:

- `json-server` on `http://localhost:3001` serving `db.json` (the products API)
- `next dev` on `http://localhost:3000` (the app)

Open [http://localhost:3000/table](http://localhost:3000/table) for the products table.

The API base URL is read from `.env.development`:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001/
```

## Architecture decisions

- **Table Component sits on client side** to make it more interactive. Data is fetched in client using tanstack query for all the server side state management and caching. (previously used dummyjson api so was useful, later swapped with local db server)
- **Route-specific components live in `_components/`.** App-wide components live in `components/`. Keeps the shared folder lean.
- **One centralized reusable `<DataTable>` component with different components (seperation of concern) .** All tables in the app go through `components/table/data-table.tsx`.
- **Centralized configuration** for dashboard navigation to extend dashboard easily.
- **Custom hooks are used** to extract stateful logic from JSX. Components stay focused on rendering.
- **State used are .** URL via nuqs (`page`, `q`, `category`, `brand`) survives refresh and shared links. React Query owns server data with `placeholderData: keepPreviousData` so paging never flashes empty. Local `useState` for sorting, column sizing, edit state .
- **Types centralised under `@types/`.** One import alias `@/@types` for `TProduct`, table meta, editing state. Renaming a field is one edit.
- **React Compiler is on.** Removes most need for manual `useMemo` / `useCallback`.
- **json-server v1 mock.** `fetchProducts` translates `{ skip, limit, category, brand }` to json-server's `_page` / `_per_page` / `field:eq`. Swapping to a real backend = one file.

## Tradeoffs made

- **Search is client side only**. Not good approach for huge data.
- **Pagination is prev/next, page size fixed at 10.** No jump-to-page, no rows-per-page selector. Page 47 = 46 clicks.
- **Column widths reset on navigation.** `columnSizing` is component-local — not persisted to URL or localStorage.
- **One row or cell edited at a time.** `useTableEditing` tracks one `editing` slot. Clicking elsewhere mid-edit silently discards the draft.
- **Click-outside cancels, doesn't save.** Avoids persisting half-typed values on misclick. Save = Enter or button.
- **json-server isn't a real API.** Different error shapes, no auth, no transactions. The bare axios instance would grow interceptors against a real backend.

## What I'd improve with more time

- **Virtualization instead of pagination**. (feels smooth and better)
- **Optimistic mutations** with rollback for update/delete, plus per-row "saving…" affordance.
- **Server-side search** wired to `q` so it works across pages, not just within the current one.
- **Real backend** with cursor pagination, faceted filters endpoint, and proper auth — at which point the axios instance grows interceptors for tokens and 401 handling.
- **Tests.** Unit tests for `productUpdateSchema` and the `normalize`/`validate` meta helpers, plus a Playwright pass over the row-edit, cell-edit, and delete flows. Right now there are none.
