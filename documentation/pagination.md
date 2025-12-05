# Pagination Component – Complete Documentation

## Overview

The `Pagination` component (exposed through the `DynamicTable` `pagination` prop) provides a fully customizable pagination solution for tables. It supports three development phases:

1. **Core Features** – Controlled mode, server‑side pagination, responsive layout.
2. **UX Enhancements** – "Go to page" input, tooltips.
3. **Advanced Features** – State persistence (localStorage / sessionStorage) and infinite scroll.

All features are optional and can be mixed to fit any use‑case.

---

## Installation & Imports

```tsx
import { DynamicTable } from "@/components"; // barrel export
// Types (optional, for TypeScript users)
import type { IPaginationConfig } from "@/components/pagination/pagination.types";
```

---

## `DynamicTable` Pagination Prop

```tsx
interface DynamicTableProps<T> {
  // …other props
  pagination?: IPaginationConfig;
  infiniteScroll?: IInfiniteScrollConfig; // Phase 3
}
```

### Main `IPaginationConfig` fields

| Prop                          | Type                                             | Description                                             |
| ----------------------------- | ------------------------------------------------ | ------------------------------------------------------- |
| `enabled`                     | `boolean`                                        | Turn pagination on/off.                                 |
| `position`                    | `'top' \| 'bottom'`                              | Where the pagination UI is rendered.                    |
| `alignment`                   | `'left' \| 'center' \| 'right'`                  | Horizontal alignment of the pagination bar.             |
| `limit`                       | `number`                                         | Initial page size.                                      |
| `limitOptions`                | `number[]`                                       | Options shown in the page‑size selector.                |
| `onPaginationChange`          | `(p: { limit: number; offset: number }) => void` | Callback when page or limit changes.                    |
| `paginationComponent`         | `ReactNode`                                      | Custom pagination component (overrides default).        |
| **Phase 1** – Controlled mode | `controlled?: IPaginationControlled`             | External control of `page` and `limit`.                 |
| **Phase 1** – Server‑side     | `serverSide?: IPaginationServerSide`             | Enable server‑side mode, total items, loading UI.       |
| **Phase 1** – Responsive      | `responsive?: IPaginationResponsive`             | Mobile breakpoint and element hiding.                   |
| **Phase 2** – Tooltips        | `tooltips?: IPaginationTooltips`                 | Enable tooltips on navigation buttons and page numbers. |
| **Phase 2** – Go‑to‑page      | `visibility?.showGoToPage` & `labels.goToPage`   | Input + button to jump to a specific page.              |
| **Phase 3** – Persistence     | `persistence?: IPaginationPersistence`           | Save page/limit to `localStorage` or `sessionStorage`.  |

---

## Phase 1 – Core Features

### Controlled Mode

```tsx
const [page, setPage] = useState(0);
const [limit, setLimit] = useState(20);

<DynamicTable
  data={data}
  pagination={{
    enabled: true,
    controlled: { page, limit, onPageChange: setPage, onLimitChange: setLimit },
  }}
/>;
```

The table will **not** manage its own state; it relies on the supplied values.

### Server‑Side Pagination

```tsx
<DynamicTable
  data={serverData}
  pagination={{
    enabled: true,
    serverSide: {
      enabled: true,
      totalItems: 1240,
      isLoading,
      loadingComponent: <Spinner />,
    },
  }}
/>
```

When `serverSide.enabled` is `true` the component expects the data already sliced for the current page.

### Responsive Design

```tsx
pagination={{
  responsive: {
    enabled: true,
    breakpoint: 768,
    hideOnMobile: ["pageNumbers", "info"]
  }
}}
```

Elements listed in `hideOnMobile` disappear when the viewport width is below `breakpoint`.

---

## Phase 2 – UX Enhancements

### Go‑to‑Page Input

```tsx
pagination={{
  visibility: { showGoToPage: true },
  labels: { goToPage: "Vai a pagina:" }
}}
```

Renders an input field with a button to jump directly to a page number.

### Tooltips

```tsx
pagination={{
  tooltips: {
    enabled: true,
    showOnButtons: true,
    showOnPageNumbers: true,
    pageNumber: (p) => `Pagina ${p + 1}`,
    first: "Prima",
    previous: "Precedente",
    next: "Successiva",
    last: "Ultima"
  }
}}
```

Adds `title` attributes to navigation buttons and page numbers.

---

## Phase 3 – Advanced Features

### State Persistence

```tsx
pagination={{
  persistence: {
    enabled: true,
    key: "users-table",
    storage: "localStorage", // or "sessionStorage"
    persistLimit: true,
    persistPage: true
  }
}}
```

The hook stores the current `page` and/or `limit` under the given `key`. When the component mounts it restores those values.

### Infinite Scroll

```tsx
const [items, setItems] = useState([]);
const [hasMore, setHasMore] = useState(true);

<DynamicTable
  data={items}
  infiniteScroll={{
    enabled: true,
    hasMore,
    loadMore: async () => {
      const more = await fetchMore();
      setItems((prev) => [...prev, ...more]);
      if (more.length === 0) setHasMore(false);
    },
    isLoading: loading,
    threshold: 120,
    loadMoreComponent: <Spinner />,
    endMessage: <div>Fine dei risultati</div>,
  }}
/>;
```

When the user scrolls within `threshold` pixels from the bottom, `loadMore` is called. The component can render a custom loading indicator and an optional end‑message.

---

## Full Example (All Phases Combined)

```tsx
const [page, setPage] = useState(0);
const [limit, setLimit] = useState(25);

<DynamicTable
  data={rows}
  pagination={{
    enabled: true,
    position: "bottom",
    alignment: "right",
    limit,
    limitOptions: [10, 25, 50, 100],
    controlled: { page, limit, onPageChange: setPage, onLimitChange: setLimit },
    serverSide: { enabled: false },
    responsive: {
      enabled: true,
      breakpoint: 768,
      hideOnMobile: ["pageNumbers"],
    },
    visibility: { showGoToPage: true },
    tooltips: { enabled: true, pageNumber: (p) => `Page ${p + 1}` },
    persistence: {
      enabled: true,
      key: "my-table",
      storage: "localStorage",
      persistPage: true,
      persistLimit: true,
    },
  }}
  infiniteScroll={{
    enabled: true,
    hasMore: hasMore,
    loadMore: fetchNext,
    isLoading: loading,
    threshold: 100,
    loadMoreComponent: <Spinner />,
    endMessage: <div>No more rows</div>,
  }}
/>;
```

This snippet demonstrates how to enable every feature with a single `pagination` object.

---

## Tips & Gotchas

- **Controlled vs Uncontrolled** – If you provide `controlled`, the internal state is ignored. Remember to also forward `onPageChange`/`onLimitChange`.
- **Persistence Key** – Use a unique key per table to avoid collisions in storage.
- **Infinite Scroll & Server‑Side** – When using infinite scroll with server‑side pagination, set `serverSide.enabled` to `true` and let `loadMore` fetch the next page from the API.
- **Styling** – All visual aspects can be overridden via the `classNames` prop (see `IPaginationClassNames`).
- **Accessibility** – The component adds appropriate `aria-label`s; you can customise them via the `labels` prop.

---

## API Reference (Types)

```ts
// pagination.types.ts – key interfaces
export interface IPaginationControlled {
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export interface IPaginationServerSide {
  enabled: boolean;
  totalItems: number;
  isLoading?: boolean;
  loadingComponent?: ReactNode;
}

export interface IPaginationResponsive {
  enabled: boolean;
  breakpoint?: number;
  hideOnMobile?: Array<
    "pageNumbers" | "info" | "pageSizeSelector" | "firstLast" | "goToPage"
  >;
}

export interface IPaginationTooltips {
  enabled?: boolean;
  showOnButtons?: boolean;
  showOnPageNumbers?: boolean;
  pageNumber?: (page: number) => string;
  first?: string;
  previous?: string;
  next?: string;
  last?: string;
}

export interface IPaginationPersistence {
  enabled: boolean;
  key: string;
  storage?: "localStorage" | "sessionStorage";
  persistLimit?: boolean;
  persistPage?: boolean;
}

export interface IInfiniteScrollConfig {
  enabled: boolean;
  hasMore: boolean;
  loadMore: () => void | Promise<void>;
  isLoading?: boolean;
  threshold?: number;
  loadMoreComponent?: ReactNode;
  endMessage?: ReactNode;
}
```

---

## Where to Find the Code

- Pagination component: `src/tables-framework/components/pagination/pagination.tsx`
- Hook for persistence: `src/tables-framework/hooks/use-pagination-persistence/use-pagination-persistence.ts`
- Infinite scroll component: `src/tables-framework/components/infinite-scroll/infinite-scroll.tsx`
- Types: `src/tables-framework/components/pagination/pagination.types.ts`

---

_Feel free to copy the examples above into your project. Adjust the props to match your UI/UX requirements._
