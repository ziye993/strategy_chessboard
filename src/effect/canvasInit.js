
import { useEffect, useRef } from "react";
//设置canvas的大小为浏览器页面的小，并且当窗口改变时也会同步更改大小
export default function useCanvasInit(canvas) {
  const canvasCtx = useRef(null);
  useEffect(() => {
    if (canvas.current === null) return; // 如果canvas为null，直接返回
    function initCanvas() { // 初始化canvas
      const dpr = window.devicePixelRatio || 1;
      const rect = { width: window.innerWidth, height: window.innerHeight };
      canvas.current.width = rect.width * dpr * 1;
      canvas.current.height = rect.height * dpr * 0.9;
      // canvas.current.width = 2000;
      // canvas.current.height = 2000;
      // canvas.current.style.marginTop = rect.height * dpr * 0.1;
    }
    initCanvas(); // 初始化canvas
    window.addEventListener("resize", initCanvas);
    return () => { // 组件卸载时移除事件监听
      window.removeEventListener("resize", initCanvas);
    }
  }, [canvas]);

  useEffect(() => {
    if (canvasCtx.current) return;
    canvasCtx.current = canvas.current.getContext("2d");
  }, [canvas.current]);
  return canvasCtx;
}