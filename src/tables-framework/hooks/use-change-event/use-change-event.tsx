import { useEffect, useRef } from "react";

function useChangeEvent(cb: (() => void) | null): void;

function useChangeEvent<TEvent = unknown>(
  cb: ((e: TEvent) => void) | null,
  e: TEvent,
  noSkip?: boolean
): void;

function useChangeEvent<TEvent = unknown>(
  cb: ((e?: TEvent) => void) | null,
  e?: TEvent,
  noSkip = false
): void {
  const skipRef = useRef(!noSkip);

  const cbRef = useRef(cb);

  useEffect(() => {
    if (cb !== cbRef.current) {
      cbRef.current = cb;
    }
  }, [cb]);

  useEffect(() => {
    if (skipRef.current) {
      skipRef.current = false;
      return;
    }

    if (cbRef.current) {
      cbRef.current(e);
    }
  }, [e]);
}

export { useChangeEvent };
