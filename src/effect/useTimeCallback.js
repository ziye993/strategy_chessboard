import { useEffect, useRef } from "react"

export default function useTimeCallback(callback, interval, immediate) {
    const timeId = useRef();
    const callbackRef = useRef();
    
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
        timeId.current = null
    }

    return { startTimeOut, startInterval, endTimeCallback };
}