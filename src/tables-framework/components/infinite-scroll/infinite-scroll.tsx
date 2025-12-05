import { useEffect, useRef, useCallback } from "react";
import styled from "@emotion/styled";
import type { IInfiniteScrollConfig } from "../pagination/pagination.types";

const LoadMoreContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
`;

const LoadMoreButton = styled.button`
  padding: 10px 24px;
  border: 1px solid #1976d2;
  border-radius: 4px;
  background: #1976d2;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #1565c0;
  }

  &:disabled {
    background: #ccc;
    border-color: #ccc;
    cursor: not-allowed;
  }
`;

const EndMessage = styled.div`
  text-align: center;
  padding: 16px;
  color: #666;
  font-size: 14px;
`;

const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

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
