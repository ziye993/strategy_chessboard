import { useEffect, useRef } from "react"
type Callback = () => void;

export default function useTimeCallback(callback: Callback,
  interval?: number,
  immediate?: boolean) {
  const timeId = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const callbackRef = useRef(() => { });

  useEffect(() => { callbackRef.current = callback }, [callback]);

  useEffect(() => {
    if (!interval) return;
    if (immediate) {
      callbackRef.current?.()
    }
    return () => { endTimeCallback() }
  }, []);

  const startTimeOut = () => {
    if (timeId.current) {
      return
    }
    timeId.current = setTimeout(() => {
      callbackRef.current?.()
    }, interval);
  }

  const startInterval = () => {
    if (timeId.current) {
      return
    }
    timeId.current = setInterval(() => {
      callbackRef.current?.()
    }, interval)
  }

  const endTimeCallback = () => {
    clearInterval(timeId.current);
    timeId.current = undefined
  }

  return { startTimeOut, startInterval, endTimeCallback };
}