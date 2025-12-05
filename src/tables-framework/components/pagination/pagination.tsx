import type { ReactNode, ReactElement } from "react";
import { useMemo, isValidElement, useState, useEffect } from "react";
import {
  PaginationContainer,
  PaginationInfo as StyledPaginationInfo,
  PaginationControls,
  PaginationButton,
  PageSizeSelect,
  PageNumbers as StyledPageNumbers,
  PageButton,
  GoToPageContainer as StyledGoToPageContainer,
  GoToPageInput as StyledGoToPageInput,
  GoToPageButton as StyledGoToPageButton,
} from "./pagination.styles";
import type {
  IPaginationCustomization,
  INavButtonProps,
  IPaginationInfoProps,
  IPageSizeSelectorProps,
  IPageNumbersProps,
  IGoToPageProps,
  TSlotRender,
} from "./pagination.types";

// Re-export types
export type * from "./pagination.types";

// Default values
const DEFAULT_VISIBILITY = {
  showInfo: true,
  showPageSizeSelector: true,
  showPrevNext: true,
  showFirstLast: false,
  showPageNumbers: true,
  showGoToPage: false, // Phase 2
};

const DEFAULT_ICONS = {
  first: "⏮",
  previous: "←",
  next: "→",
  last: "⏭",
};

const DEFAULT_LABELS = {
  rowsPerPage: "Righe per pagina:",
  of: "di",
  page: "Pagina",
  firstPage: "Prima pagina",
  previousPage: "Pagina precedente",
  nextPage: "Pagina successiva",
  lastPage: "Ultima pagina",
  // Phase 2
  goToPage: "Vai a pagina:",
  go: "Vai",
  goToPagePlaceholder: "#",
};

// Phase 2: Default tooltips
const DEFAULT_TOOLTIPS = {
  enabled: false,
  showOnButtons: true,
  showOnPageNumbers: true,
  pageNumber: (page: number) => `Vai a pagina ${page + 1}`,
  first: "Prima pagina",
  previous: "Pagina precedente",
  next: "Pagina successiva",
  last: "Ultima pagina",
};

// Helper to render slots
function renderSlot<T>(
  slot: TSlotRender<T> | undefined,
  props: T,
  defaultRender: () => ReactNode
): ReactNode {
  if (!slot) {
    return defaultRender();
  }

  if (typeof slot === "function") {
    return slot(props);
  }

  if (isValidElement(slot)) {
    return slot;
  }

  return defaultRender();
}

// Sub-components for external use
const PaginationInfoDisplay = ({
  startItem,
  endItem,
  totalItems,
  label = DEFAULT_LABELS.of,
  className,
}: IPaginationInfoProps & { className?: string }) => (
  <StyledPaginationInfo className={className}>
    {startItem}-{endItem} {label} {totalItems}
  </StyledPaginationInfo>
);

const PageSizeSelector = ({
  value,
  options,
  onChange,
  label = DEFAULT_LABELS.rowsPerPage,
  className,
}: IPageSizeSelectorProps & { className?: string }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number.parseInt(e.target.value, 10);
    onChange(newSize);
  };

  return (
    <StyledPaginationInfo className={className}>
      {label}
      <PageSizeSelect
        value={value}
        onChange={handleChange}
        style={{ marginLeft: 8 }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </PageSizeSelect>
    </StyledPaginationInfo>
  );
};

const NavButton = ({
  onClick,
  disabled,
  children,
  ariaLabel,
  className,
  tooltip,
}: INavButtonProps & {
  ariaLabel?: string;
  className?: string;
  tooltip?: string;
}) => (
  <PaginationButton
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    className={className}
    title={tooltip}
  >
    {children}
  </PaginationButton>
);

// Phase 2: GoToPage sub-component
const GoToPage = ({
  currentPage,
  totalPages,
  onPageChange,
  label,
  buttonLabel,
  placeholder,
  className,
  inputClassName,
  buttonClassName,
}: IGoToPageProps & {
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = () => {
    const page = Number.parseInt(inputValue, 10) - 1;
    if (Number.isFinite(page) && page >= 0 && page < totalPages) {
      onPageChange(page);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <StyledGoToPageContainer className={className}>
      {label && <span>{label}</span>}
      <StyledGoToPageInput
        type="number"
        min={1}
        max={totalPages}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? String(currentPage + 1)}
        className={inputClassName}
      />
      <StyledGoToPageButton onClick={handleSubmit} className={buttonClassName}>
        {buttonLabel}
      </StyledGoToPageButton>
    </StyledGoToPageContainer>
  );
};

const PageNumbersList = ({
  pages,
  currentPage,
  onPageChange,
  className,
  activeClassName,
  getTooltip,
}: IPageNumbersProps & {
  className?: string;
  activeClassName?: string;
  getTooltip?: (page: number) => string;
}) => (
  <StyledPageNumbers className={className}>
    {pages.map((page, index) =>
      typeof page === "number" ? (
        <PageButton
          key={page}
          isActive={page === currentPage}
          onClick={() => onPageChange(page)}
          className={page === currentPage ? activeClassName : undefined}
          title={getTooltip?.(page)}
        >
          {page + 1}
        </PageButton>
      ) : (
        <span
          key={`ellipsis-${currentPage > 1 && index === 1 ? "start" : "end"}`}
          style={{ padding: "0 4px" }}
        >
          {page}
        </span>
      )
    )}
  </StyledPageNumbers>
);

// Main props interface
interface IPaginationProps extends IPaginationCustomization {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  alignment?: "left" | "center" | "right";
  // Phase 1 props
  isLoading?: boolean;
  loadingComponent?: React.ReactNode;
  // Phase 2 props are in IPaginationCustomization
}

const Pagination = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50],
  alignment = "right",
  // Customization
  visibility: visibilityProp,
  icons: iconsProp,
  labels: labelsProp,
  slots,
  classNames,
  // Phase 1 props
  isLoading = false,
  loadingComponent,
  responsive,
  // Phase 2 props
  tooltips: tooltipsProp,
}: IPaginationProps) => {
  // Merge with defaults - wrapped in useMemo for stable references
  const visibility = useMemo(
    () => ({ ...DEFAULT_VISIBILITY, ...visibilityProp }),
    [visibilityProp]
  );
  const icons = useMemo(
    () => ({ ...DEFAULT_ICONS, ...iconsProp }),
    [iconsProp]
  );
  const labels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labelsProp }),
    [labelsProp]
  );
  const tooltips = useMemo(
    () => ({ ...DEFAULT_TOOLTIPS, ...tooltipsProp }),
    [tooltipsProp]
  );

  // Responsive: determine if in mobile view
  const [isMobile, setIsMobile] = useState(false);
  const breakpoint = responsive?.breakpoint ?? 768;
  const hideOnMobile = responsive?.hideOnMobile;

  useEffect(() => {
    if (!responsive?.enabled) return;

    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [responsive?.enabled, breakpoint]);

  // Apply responsive visibility overrides
  const effectiveVisibility = useMemo(() => {
    if (!isMobile || !hideOnMobile) return visibility;

    const result = { ...visibility };
    if (hideOnMobile.includes("pageNumbers")) result.showPageNumbers = false;
    if (hideOnMobile.includes("info")) result.showInfo = false;
    if (hideOnMobile.includes("pageSizeSelector"))
      result.showPageSizeSelector = false;
    if (hideOnMobile.includes("firstLast")) result.showFirstLast = false;
    if (hideOnMobile.includes("goToPage")) result.showGoToPage = false;
    return result;
  }, [isMobile, hideOnMobile, visibility]);

  // Computed values
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalItems);
  const canGoPrevious = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;
  const canGoFirst = currentPage > 0;
  const canGoLast = currentPage < totalPages - 1;

  // Handlers
  const handleFirst = () => onPageChange(0);
  const handlePrevious = () => canGoPrevious && onPageChange(currentPage - 1);
  const handleNext = () => canGoNext && onPageChange(currentPage + 1);
  const handleLast = () => onPageChange(totalPages - 1);
  const handlePageSizeChange = (size: number) => onPageSizeChange?.(size);

  // Page numbers calculation
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(0);

      const start = Math.max(1, currentPage - 1);
      const end = Math.min(totalPages - 2, currentPage + 1);

      if (start > 1) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages - 1);
    }

    return pages;
  }, [currentPage, totalPages]);

  // Early return if no items
  if (totalItems === 0) {
    return null;
  }

  // Full state for container slot
  const paginationState = {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    startItem,
    endItem,
    canGoPrevious,
    canGoNext,
    canGoFirst,
    canGoLast,
    onPageChange,
    onPageSizeChange: handlePageSizeChange,
    pageSizeOptions,
  };

  // If container slot is provided, use it for complete override
  if (slots?.container) {
    return renderSlot(
      slots.container,
      paginationState,
      () => null
    ) as ReactElement;
  }

  // Show loading component if loading
  if (isLoading && loadingComponent) {
    return <>{loadingComponent}</>;
  }

  return (
    <PaginationContainer
      alignment={alignment}
      className={classNames?.container}
    >
      {/* Page Size Selector */}
      {effectiveVisibility.showPageSizeSelector &&
        onPageSizeChange &&
        renderSlot(
          slots?.pageSizeSelector,
          {
            value: pageSize,
            options: pageSizeOptions,
            onChange: handlePageSizeChange,
            label: labels.rowsPerPage,
          },
          () => (
            <PageSizeSelector
              value={pageSize}
              options={pageSizeOptions}
              onChange={handlePageSizeChange}
              label={labels.rowsPerPage}
              className={classNames?.select}
            />
          )
        )}

      {/* Info Display */}
      {effectiveVisibility.showInfo &&
        renderSlot(
          slots?.info,
          { startItem, endItem, totalItems, label: labels.of },
          () => (
            <PaginationInfoDisplay
              startItem={startItem}
              endItem={endItem}
              totalItems={totalItems}
              label={labels.of}
              className={classNames?.info}
            />
          )
        )}

      <PaginationControls className={classNames?.controls}>
        {/* First Button */}
        {effectiveVisibility.showFirstLast &&
          renderSlot(
            slots?.firstButton,
            {
              onClick: handleFirst,
              disabled: !canGoFirst,
              children: icons.first,
            },
            () => (
              <NavButton
                onClick={handleFirst}
                disabled={!canGoFirst}
                ariaLabel={labels.firstPage}
                className={
                  canGoFirst ? classNames?.button : classNames?.buttonDisabled
                }
              >
                {icons.first}
              </NavButton>
            )
          )}

        {/* Previous Button */}
        {effectiveVisibility.showPrevNext &&
          renderSlot(
            slots?.prevButton,
            {
              onClick: handlePrevious,
              disabled: !canGoPrevious,
              children: icons.previous,
            },
            () => (
              <NavButton
                onClick={handlePrevious}
                disabled={!canGoPrevious}
                ariaLabel={labels.previousPage}
                className={
                  canGoPrevious
                    ? classNames?.button
                    : classNames?.buttonDisabled
                }
              >
                {icons.previous}
              </NavButton>
            )
          )}

        {/* Page Numbers */}
        {effectiveVisibility.showPageNumbers &&
          renderSlot(
            slots?.pageNumbers,
            { pages: pageNumbers, currentPage, onPageChange },
            () => (
              <PageNumbersList
                pages={pageNumbers}
                currentPage={currentPage}
                onPageChange={onPageChange}
                className={classNames?.pageNumbers}
                activeClassName={classNames?.activeButton}
                getTooltip={
                  tooltips.enabled && tooltips.showOnPageNumbers
                    ? tooltips.pageNumber
                    : undefined
                }
              />
            )
          )}

        {/* Go to Page (Phase 2) */}
        {effectiveVisibility.showGoToPage &&
          renderSlot(
            slots?.goToPage,
            {
              currentPage,
              totalPages,
              onPageChange,
              label: labels.goToPage,
              buttonLabel: labels.go,
              placeholder: labels.goToPagePlaceholder,
            },
            () => (
              <GoToPage
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                label={labels.goToPage}
                buttonLabel={labels.go}
                placeholder={labels.goToPagePlaceholder}
                className={classNames?.goToPageContainer}
                inputClassName={classNames?.goToPageInput}
                buttonClassName={classNames?.goToPageButton}
              />
            )
          )}

        {/* Next Button */}
        {effectiveVisibility.showPrevNext &&
          renderSlot(
            slots?.nextButton,
            { onClick: handleNext, disabled: !canGoNext, children: icons.next },
            () => (
              <NavButton
                onClick={handleNext}
                disabled={!canGoNext}
                ariaLabel={labels.nextPage}
                className={
                  canGoNext ? classNames?.button : classNames?.buttonDisabled
                }
              >
                {icons.next}
              </NavButton>
            )
          )}

        {/* Last Button */}
        {effectiveVisibility.showFirstLast &&
          renderSlot(
            slots?.lastButton,
            { onClick: handleLast, disabled: !canGoLast, children: icons.last },
            () => (
              <NavButton
                onClick={handleLast}
                disabled={!canGoLast}
                ariaLabel={labels.lastPage}
                className={
                  canGoLast ? classNames?.button : classNames?.buttonDisabled
                }
              >
                {icons.last}
              </NavButton>
            )
          )}
      </PaginationControls>
    </PaginationContainer>
  );
};

export type { IPaginationProps };
export {
  Pagination,
  // Sub-components for external use
  PaginationInfoDisplay,
  PageSizeSelector,
  NavButton,
  PageNumbersList,
  GoToPage,
};
