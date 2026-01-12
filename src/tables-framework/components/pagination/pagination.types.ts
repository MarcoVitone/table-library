import type { ReactNode } from "react";

// Pagination state passed to custom components
interface IPaginationState {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  startItem: number;
  endItem: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  canGoFirst: boolean;
  canGoLast: boolean;
  isLoading?: boolean;
}

// Props for navigation buttons
interface INavButtonProps {
  onClick: () => void;
  disabled: boolean;
  children?: ReactNode;
}

// Props for info display
interface IPaginationInfoProps {
  startItem: number;
  endItem: number;
  totalItems: number;
  label?: string;
}

// Props for page size selector
interface IPageSizeSelectorProps {
  value: number;
  options: number[];
  onChange: (size: number) => void;
  label?: string;
}

// Props for page numbers
interface IPageNumbersProps {
  pages: (number | string)[];
  currentPage: number;
  onPageChange: (page: number) => void;
}

// Props for Go to Page input (Phase 2)
interface IGoToPageProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label?: string;
  buttonLabel?: string;
  placeholder?: string;
}

// Visibility control for each element
interface IPaginationVisibility {
  showInfo?: boolean;
  showPageSizeSelector?: boolean;
  showPrevNext?: boolean;
  showFirstLast?: boolean;
  showPageNumbers?: boolean;
  showGoToPage?: boolean; // Phase 2
}

// Custom icons
interface IPaginationIcons {
  first?: ReactNode;
  previous?: ReactNode;
  next?: ReactNode;
  last?: ReactNode;
}

// Localizable labels
interface IPaginationLabels {
  rowsPerPage?: string;
  of?: string;
  page?: string;
  firstPage?: string;
  previousPage?: string;
  nextPage?: string;
  lastPage?: string;
  // Phase 2
  goToPage?: string;
  go?: string;
  goToPagePlaceholder?: string;
}

// Slot render functions or ReactNodes
type TSlotRender<T> = ReactNode | ((props: T) => ReactNode);

interface IPaginationSlots {
  info?: TSlotRender<IPaginationInfoProps>;
  pageSizeSelector?: TSlotRender<IPageSizeSelectorProps>;
  prevButton?: TSlotRender<INavButtonProps>;
  nextButton?: TSlotRender<INavButtonProps>;
  firstButton?: TSlotRender<INavButtonProps>;
  lastButton?: TSlotRender<INavButtonProps>;
  pageNumbers?: TSlotRender<IPageNumbersProps>;
  goToPage?: TSlotRender<IGoToPageProps>; // Phase 2
  // Complete override - renders entire pagination
  container?: TSlotRender<
    IPaginationState & {
      onPageChange: (page: number) => void;
      onPageSizeChange: (size: number) => void;
      pageSizeOptions: number[];
    }
  >;
}

// Custom CSS class names
interface IPaginationClassNames {
  container?: string;
  info?: string;
  controls?: string;
  button?: string;
  buttonDisabled?: string;
  activeButton?: string;
  select?: string;
  pageNumbers?: string;
  goToPageContainer?: string; // Phase 2
  goToPageInput?: string; // Phase 2
  goToPageButton?: string; // Phase 2
}

// *** PHASE 1 - FEATURES ***

// Controlled Mode - external state management
interface IPaginationControlled {
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

// Server-Side Pagination
interface IPaginationServerSide {
  enabled: boolean;
  totalItems: number;
  isLoading?: boolean;
  loadingComponent?: ReactNode;
}

// Responsive Design
type TResponsiveLayout = "default" | "compact" | "minimal";

interface IPaginationResponsive {
  enabled?: boolean;
  breakpoint?: number; // px, default 768
  mobileLayout?: TResponsiveLayout;
  hideOnMobile?: (
    | "pageNumbers"
    | "info"
    | "pageSizeSelector"
    | "firstLast"
    | "goToPage"
  )[];
}

// *** PHASE 2 - FEATURES ***

// Tooltips configuration
interface IPaginationTooltips {
  enabled?: boolean;
  showOnButtons?: boolean;
  showOnPageNumbers?: boolean;
  pageNumber?: (page: number) => string; // Dynamic tooltip for page buttons
  first?: string;
  previous?: string;
  next?: string;
  last?: string;
}

// URL Sync configuration
interface IPaginationUrlSync {
  enabled: boolean;
  pageParam?: string; // default: 'page'
  limitParam?: string; // default: 'limit'
  useHash?: boolean; // Use hash instead of query params
}

// *** PHASE 3 - FEATURES ***

// State Persistence configuration
type TPersistenceStorage = "localStorage" | "sessionStorage";

interface IPaginationPersistence {
  enabled: boolean;
  key: string; // Unique key for storage
  storage?: TPersistenceStorage; // default: 'localStorage'
  persistLimit?: boolean; // default: true
  persistPage?: boolean; // default: false
  persistLayout?: boolean; // default: true
  persistDensity?: boolean; // default: true
}

// Infinite Scroll configuration
interface IInfiniteScrollConfig {
  enabled: boolean;
  hasMore: boolean;
  loadMore: () => void | Promise<void>;
  isLoading?: boolean;
  threshold?: number; // px from bottom to trigger, default 100
  loadMoreComponent?: ReactNode;
  endMessage?: ReactNode;
}

// Complete customization config
interface IPaginationCustomization {
  visibility?: IPaginationVisibility;
  icons?: IPaginationIcons;
  labels?: IPaginationLabels;
  slots?: IPaginationSlots;
  classNames?: IPaginationClassNames;
  // Phase 1 features
  controlled?: IPaginationControlled;
  serverSide?: IPaginationServerSide;
  responsive?: IPaginationResponsive;
  // Phase 2 features
  tooltips?: IPaginationTooltips;
  urlSync?: IPaginationUrlSync;
  // Phase 3 features
  persistence?: IPaginationPersistence;
}

export type {
  IPaginationState,
  INavButtonProps,
  IPaginationInfoProps,
  IPageSizeSelectorProps,
  IPageNumbersProps,
  IGoToPageProps,
  IPaginationVisibility,
  IPaginationIcons,
  IPaginationLabels,
  IPaginationSlots,
  IPaginationClassNames,
  IPaginationCustomization,
  TSlotRender,
  // Phase 1 exports
  IPaginationControlled,
  IPaginationServerSide,
  IPaginationResponsive,
  TResponsiveLayout,
  // Phase 2 exports
  IPaginationTooltips,
  IPaginationUrlSync,
  // Phase 3 exports
  IPaginationPersistence,
  TPersistenceStorage,
  IInfiniteScrollConfig,
};
