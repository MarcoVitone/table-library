# Accessibility configuration

The consuming application owns accessibility: names, descriptions, relationships,
announcements, focus policies and custom components. The library supplies defaults
that can be retained, overridden individually or disabled.

Both `DynamicTable` and `Table` accept `accessibility?: ITableAccessibility`.
Omitting it retains the library defaults. `tableLabel` is a shorthand for the
default table name; `accessibility.slotProps.table` takes precedence.

```tsx
import { DynamicTable, type ITableAccessibility } from 'fabulous-table-library';

const accessibility: ITableAccessibility = {
  slotProps: {
    table: { 'aria-labelledby': 'customers-heading', 'aria-label': undefined },
    rowCheckbox: ({ rowId }) => ({ 'aria-label': `Select customer ${rowId}` }),
    sortButton: ({ column }) => ({ 'aria-label': `Sort by ${column?.label}` }),
    cellInput: ({ rowId, columnId }) => ({
      'aria-label': `Edit ${columnId} for customer ${rowId}`,
    }),
    pageButton: ({ index }) => ({ 'aria-label': `Page ${(index ?? 0) + 1}` }),
  },
  messages: {
    selectionCount: ({ count }) => `${count} customers selected`,
    columnMoved: ({ position }) => `Column moved to position ${position}`,
    saving: 'Saving changes',
  },
};

// Inside your component, with data and columns supplied by the application:
<>
  <h2 id="customers-heading">Customers</h2>
  <DynamicTable data={data} columns={columns} accessibility={accessibility} />
</>;
```

## Override order and removal

Resolution order is the element's default props, `slotProps[slot]`, then
`getProps(slot, resolvedProps, context)`. Each stage shallowly merges its result
over the preceding stage. Unspecified properties survive. An explicit `undefined`
removes a property from the rendered element; deleting a key from the returned
object does not remove the default. Return `undefined` from `getProps` to keep
the preceding result. Do not mutate the provided props or context.

`slotProps` accepts a props object or `(context, defaults) => props` for each slot.
The callbacks receive the current element's props, including state-dependent ARIA
values. They can override `aria-*`, `role`, `id`, `title`, `tabIndex`, `scope`,
`headers`, `htmlFor`, `autoFocus`, and keyboard/focus handlers. Handlers replace
the previous handler; call the provided default when you want to preserve it.
`children` can replace the content of label, title and announcement slots.

```tsx
const accessibility: ITableAccessibility = {
  getProps(slot, props, context) {
    if (slot === 'dragHandle') {
      return {
        title: undefined,
        'aria-keyshortcuts': undefined,
        onKeyDown: event => {
          // Application handling, then optionally the default handling:
          props.onKeyDown?.(event);
        },
      };
    }
    if (slot === 'cell' && context.area === 'header') {
      return { 'aria-describedby': `help-${context.columnId}` };
    }
  },
};
```

`context` includes `cell`, `row`, `column`, `area`, zero-based `index`, `rowId`,
`columnId`, `actionId`, `label`, `count` and `position` when relevant. A cell's
`index` is its column position, a row's `index` is its row position, and a page
button's `index` is its zero-based page. `row.source.full` contains the original
record. `rowId` uses the parser's serialized source ID, including `"0"`.
Custom components nested in rows and cells inherit this context.

## Start without generated defaults

```tsx
<DynamicTable
  data={data}
  columns={columns}
  accessibility={{
    useDefaults: false,
    slotProps: {
      table: { 'aria-labelledby': 'customers-heading' },
      sortButton: ({ columnId }) => ({ 'aria-label': `Sort ${columnId}` }),
    },
    dialog: { modal: false, trapFocus: false, restoreFocus: false },
  }}
/>
```

`useDefaults: false` removes initial `aria-*`, `role`, `scope`, `headers`,
`tabIndex`, `title`, `autoFocus` and SVG `focusable` values before applying consumer
overrides. It also suppresses fallback announcement text from `messages`.
Native HTML elements and their browser behavior remain: a button is still a
button, a disabled input stays disabled, and a wrapping label still labels its
control. IDs, visible text, functional handlers and dialog behavior are preserved.
Use slot overrides or custom components to change these further.

## Shared configuration and custom components

Use `AccessibilityProvider` for an application-wide or subtree policy, including
standalone library controls. A table's `accessibility` overrides its inherited
configuration. Nested providers merge slot entries, message entries and individual
dialog options; a child entry for the same slot replaces that parent's entry.
The nearest `getProps` callback replaces the inherited callback. A table without
an `accessibility` prop inherits its provider unchanged. Portals retain the policy.

```tsx
import { AccessibilityProvider, useTableAccessibility } from 'fabulous-table-library';

function CustomCellLink() {
  const { getProps } = useTableAccessibility();
  return <a href="/customers" {...getProps('cellLink', { 'aria-label': 'Customers' })}>
    Customers
  </a>;
}

<AccessibilityProvider value={{ slotProps: { icon: { 'aria-hidden': true } } }}>
  <DynamicTable data={data} columns={columns} />
</AccessibilityProvider>;
```

Custom renderers own their markup. Call `useTableAccessibility().getProps(...)`
and forward the returned props to the desired native element to participate in
the policy. `AccessibilityScope` is also exported to supply context outside the
built-in row/cell renderer. The hook's `message(key, fallback, context?)` resolves
messages using the same inherited context.

## Dialog focus

`dialog.modal` defaults to `true` and chooses native `showModal()`; `false` uses
`show()`. Native modal dialogs contain focus through the browser. To replace
focus containment entirely, set both `modal: false` and `trapFocus: false`.
`trapFocus` controls the additional library Tab handler; `restoreFocus` controls
the library's explicit restoration to the previously focused element. Both
default to `true`. Browser focus behavior can still occur independently.
The `dialog` slot can replace keyboard, cancel and focus handlers; `dialogTitle`
can replace the title content and ID. Update `aria-labelledby` together with a
custom title ID. Likewise keep `aria-controls`, `aria-activedescendant`, label
`htmlFor` and editor descriptions consistent when overriding related IDs.

## Available slots

| Area | Slots |
| :--- | :--- |
| Structure | `table`, `header`, `body`, `footer`, `row`, `cell`, `scrollRegion`, `virtualSpacer` |
| Column controls | `sortButton`, `dragHandle`, `dragStatus`, `resizeHandle`, `collapseButton` |
| Filters | `filterButton`, `filterLabel`, `filterInput`, `filterResetButton` |
| Dialog and configuration | `dialog`, `dialogTitle`, `columnLabel`, `resetLayoutButton`, `configureColumnsButton`, `closeConfigButton`, `resetConfigButton`, `moveColumnUpButton`, `moveColumnDownButton`, `columnVisibility` |
| Selection and editing | `selectAllCheckbox`, `rowCheckbox`, `rowAction`, `cellInput`, `cellEditor`, `cellError`, `cellSaving` |
| Autocomplete | `autocompleteInput`, `autocompleteList`, `autocompleteOption`, `autocompleteEmpty`, `autocompleteClearButton`, `autocompleteToggleButton` |
| Table feedback and search | `tableState`, `retryButton`, `globalSearchLabel`, `globalSearchInput`, `globalSearchClearButton` |
| Bulk actions | `bulkActions`, `bulkToolbar`, `bulkSelectionStatus`, `bulkAction`, `bulkClearButton`, `bulkPending`, `bulkError`, `bulkErrorCloseButton` |
| Saved views | `savedViews`, `savedViewSelectLabel`, `savedViewSelect`, `savedViewNameLabel`, `savedViewName`, `savedViewApplyButton`, `savedViewSaveButton`, `savedViewUpdateButton`, `savedViewDeleteButton`, `savedViewStatus`, `savedViewError` |
| Pagination | `pagination`, `pageSizeSelect`, `pageButton`, `pageNavigationButton`, `goToPageInput`, `goToPageButton` |
| Other controls | `button`, `checkbox`, `chip`, `chipDeleteButton`, `cellLink`, `icon`, `expandedDetails`, `expandedSummary`, `loadMoreButton`, `loadMoreStatus`, `loadMoreEnd` |

Slots match exact names: `button` configures generic buttons; use `sortButton`,
`rowAction`, etc. for specialized controls. Use `getProps` for a policy spanning
multiple slot names. Slot names and ARIA values are checked by TypeScript.

`messages` keys are `columnMoved`, `selectionCount`, `saving`, `bulkPending` and
`autocompleteEmpty`. Values are strings or `(context) => string`; an empty string
suppresses the announcement. Other feedback content can be replaced through
its slot's `children` or the existing content props such as `loadingContent`,
`emptyContent`, `noResultsContent`, `error` and `infiniteScroll.endMessage`.
