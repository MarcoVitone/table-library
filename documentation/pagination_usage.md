# Pagina​zione – Guida Completa all'Utilizzo

## 1. Introduzione

La libreria **tables‑framework** fornisce il componente `Pagination` (esposto tramite la prop `pagination` di `DynamicTable`) con **tre fasi di funzionalità**:

| Fase             | Funzionalità                                               | Descrizione                                                                                                                              |
| ---------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **1 – Core**     | Controlled mode, Server‑side pagination, Responsive design | Controllo completo dello stato di pagina/limit, supporto a API server‑side e layout mobile.                                              |
| **2 – UX**       | Go‑to‑page, Tooltips                                       | Input per salto diretto a una pagina e tooltip informativi sui pulsanti.                                                                 |
| **3 – Avanzate** | State persistence, Infinite scroll, Horizontal scroll      | Salvataggio di pagina/limit in `localStorage`/`sessionStorage`, caricamento automatico di nuovi dati e scroll orizzontale della tabella. |

Questa guida mostra **come configurare** ogni funzionalità e fornisce esempi pratici.

---

## 2. Installazione & Import

```tsx
// Import dal barrel export (src/tables-framework/components/index.ts)
import { DynamicTable } from "@/components";
// Tipi (opzionali, per TypeScript)
import type {
  IPaginationConfig,
  IInfiniteScrollConfig,
} from "@/components/pagination/pagination.types";
```

> **Nota:** il percorso `@/components` è definito tramite alias del progetto; in caso contrario usa il percorso relativo `../../src/tables-framework/components`.

---

## 3. Prop `pagination` di `DynamicTable`

```ts
interface IPaginationConfig extends IPaginationCustomization {
  enabled?: boolean; // attiva/disattiva la paginazione
  position?: "top" | "bottom"; // dove renderizzare la barra
  alignment?: "left" | "center" | "right"; // allineamento orizzontale
  limit?: number; // dimensione pagina iniziale
  limitOptions?: number[]; // opzioni per il selettore di pagina
  onPaginationChange?: (p: { limit: number; offset: number }) => void;
  paginationComponent?: ReactNode; // componente custom (sovrascrive quello di default)
  // ----- Phase 1 -----
  controlled?: IPaginationControlled; // { page, limit, onPageChange, onLimitChange }
  serverSide?: IPaginationServerSide; // { enabled, totalItems, isLoading, loadingComponent }
  responsive?: IPaginationResponsive; // { enabled, breakpoint, hideOnMobile }
  // ----- Phase 2 -----
  tooltips?: IPaginationTooltips; // tooltip config
  // ----- Phase 3 -----
  persistence?: IPaginationPersistence; // state persistence config
}
```

### 3.1 Prop `infiniteScroll`

```ts
interface IInfiniteScrollConfig {
  enabled: boolean; // attiva lo scroll infinito
  hasMore: boolean; // indica se ci sono altri dati da caricare
  loadMore: () => void | Promise<void>; // callback per il fetch dei nuovi dati
  isLoading?: boolean; // mostra spinner durante il caricamento
  threshold?: number; // px dal fondo per attivare il load (default 100)
  loadMoreComponent?: ReactNode; // UI custom per il caricamento
  endMessage?: ReactNode; // messaggio quando non ci sono più dati
}
```

---

## 4. Esempi di Utilizzo

### 4.1 Core – Controlled Mode

```tsx
const [page, setPage] = useState(0);
const [limit, setLimit] = useState(20);

<DynamicTable
  data={rows}
  pagination={{
    enabled: true,
    controlled: { page, limit, onPageChange: setPage, onLimitChange: setLimit },
    position: "bottom",
    alignment: "right",
    limitOptions: [10, 20, 50],
  }}
/>;
```

### 4.2 Core – Server‑Side Pagination

```tsx
const fetchPage = async (page: number, limit: number) => {
  const res = await fetch(`/api/users?page=${page}&limit=${limit}`);
  const { data, total } = await res.json();
  setRows(data);
  setTotalItems(total);
};

<DynamicTable
  data={rows}
  pagination={{
    enabled: true,
    serverSide: {
      enabled: true,
      totalItems,
      isLoading,
      loadingComponent: <Spinner />,
    },
    controlled: { page, limit, onPageChange: setPage, onLimitChange: setLimit },
  }}
/>;
```

### 4.3 UX – Go‑to‑Page & Tooltips

```tsx
<DynamicTable
  data={rows}
  pagination={{
    enabled: true,
    visibility: { showGoToPage: true },
    labels: { goToPage: "Vai a pagina:" },
    tooltips: {
      enabled: true,
      showOnButtons: true,
      pageNumber: (p) => `Pagina ${p + 1}`,
      first: "Prima",
      previous: "Precedente",
      next: "Successiva",
      last: "Ultima",
    },
  }}
/>
```

### 4.4 Advanced – State Persistence

```tsx
<DynamicTable
  data={rows}
  pagination={{
    enabled: true,
    persistence: {
      enabled: true,
      key: "users-table",
      storage: "localStorage", // oppure "sessionStorage"
      persistPage: true,
      persistLimit: true,
    },
  }}
/>
```

> La prima visita della tabella ripristinerà pagina e limit salvati.

### 4.5 Advanced – Infinite Scroll

```tsx
const [items, setItems] = useState([]);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  const next = await fetchMore();
  setItems((prev) => [...prev, ...next]);
  if (next.length === 0) setHasMore(false);
};

<DynamicTable
  data={items}
  infiniteScroll={{
    enabled: true,
    hasMore,
    loadMore,
    isLoading: loading,
    threshold: 120,
    loadMoreComponent: <Spinner />,
    endMessage: <div>Fine dei risultati</div>,
  }}
/>;
```

### 4.6 Horizontal Scroll (larghe tabelle)

Il componente `DynamicTable` avvolge automaticamente la tabella in un `<div style={{ overflowX: "auto" }}>`. Non è necessario alcun ulteriore codice; basta impostare le colonne con larghezze (es. `width: "200px"`).

---

## 5. Consigli Pratici

- **Controlled vs Uncontrolled**: se fornisci `controlled`, il componente ignora lo stato interno. Ricorda di gestire `onPageChange`/`onLimitChange`.
- **Chiave di Persistence**: scegli una chiave unica per ogni tabella (`"users-table"`, `"orders-table"`…) per evitare conflitti.
- **Responsive**: usa `responsive.hideOnMobile` per nascondere elementi non essenziali su schermi piccoli.
- **Infinite Scroll + Server‑Side**: imposta `serverSide.enabled` a `true` e usa `loadMore` per richiedere la pagina successiva al server.
- **Styling**: tutti gli stili sono personalizzabili tramite la prop `classNames` (vedi `IPaginationClassNames`).

---

## 6. API di Riferimento (Tipi)

```ts
// src/tables-framework/components/pagination/pagination.types.ts
export interface IPaginationControlled {
  page: number;
  limit: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
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
export interface IPaginationCustomization {
  visibility?: IPaginationVisibility;
  icons?: IPaginationIcons;
  labels?: IPaginationLabels;
  slots?: IPaginationSlots;
  classNames?: IPaginationClassNames;
  controlled?: IPaginationControlled;
  serverSide?: IPaginationServerSide;
  responsive?: IPaginationResponsive;
  tooltips?: IPaginationTooltips;
  persistence?: IPaginationPersistence;
}
```

---

## 7. Dove Trovare il Codice

- **Componenti**: `src/tables-framework/components/pagination/pagination.tsx`
- **Hook di Persistence**: `src/tables-framework/hooks/use-pagination-persistence/use-pagination-persistence.ts`
- **Infinite Scroll**: `src/tables-framework/components/infinite-scroll/infinite-scroll.tsx`
- **Tipi**: `src/tables-framework/components/pagination/pagination.types.ts`

---

_Questa documentazione è pensata per essere inserita nella cartella `documentation` del progetto, pronta per essere letta da sviluppatori e designer._
