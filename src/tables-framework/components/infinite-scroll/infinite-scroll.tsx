import { useEffect, useRef, useCallback } from "react";
import { nativeElement } from "@/tables-framework/ui/native-element";
import type { IInfiniteScrollConfig } from "@/tables-framework/components/pagination/pagination.types";

const LoadMoreContainer=nativeElement('div','tbl-load-more',()=>({display:'flex',justifyContent:'center',alignItems:'center',padding:16}));
const LoadMoreButton=nativeElement('button','tbl-button tbl-button-contained',()=>({padding:'10px 24px',fontSize:14}));
const EndMessage=nativeElement('div','tbl-end-message',()=>({textAlign:'center',padding:16,color:'#666',fontSize:14}));
const Spinner=nativeElement('div','tbl-spinner',()=>({width:24,height:24,border:'3px solid #f3f3f3',borderTopColor:'#1976d2',borderRadius:'50%',animation:'tbl-spin 1s linear infinite'}));

interface IInfiniteScrollProps extends Omit<IInfiniteScrollConfig, "enabled"> {
  className?: string;
  mode?: "auto" | "button"; // auto = intersection observer, button = manual click
  buttonText?: string;
}

const InfiniteScroll = ({
  hasMore,
  loadMore,
  isLoading = false,
  threshold = 100,
  loadMoreComponent,
  endMessage,
  className,
  mode = "auto",
  buttonText = "Carica altri",
}: IInfiniteScrollProps) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Auto mode: use Intersection Observer
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading) {
        loadMore();
      }
    },
    [hasMore, isLoading, loadMore]
  );

  useEffect(() => {
    if (mode !== "auto") return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin: `${threshold}px`,
    });

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [mode, threshold, handleIntersection]);

  // Button mode: manual trigger
  const handleButtonClick = () => {
    if (hasMore && !isLoading) {
      loadMore();
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <LoadMoreContainer className={className}>
        {loadMoreComponent ?? <Spinner />}
      </LoadMoreContainer>
    );
  }

  // Render end message
  if (!hasMore) {
    if (endMessage) {
      return <EndMessage className={className}>{endMessage}</EndMessage>;
    }
    return null;
  }

  // Render based on mode
  if (mode === "button") {
    return (
      <LoadMoreContainer className={className}>
        <LoadMoreButton onClick={handleButtonClick} disabled={isLoading}>
          {buttonText}
        </LoadMoreButton>
      </LoadMoreContainer>
    );
  }

  // Auto mode: render sentinel
  return <div ref={sentinelRef} style={{ height: 1 }} />;
};

export { InfiniteScroll };
export type { IInfiniteScrollProps };
