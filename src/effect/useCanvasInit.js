
import { useEffect, useRef } from "react";
//设置canvas的大小为浏览器页面的小，并且当窗口改变时也会同步更改大小
export default function useCanvasInit(canvas) {
  const canvasCtx = useRef(null);
  useEffect(() => {
    if (canvasCtx.current) return;
    canvasCtx.current = canvas.current.getContext("2d");
    function initCanvas() { // 初始化canvas
      const parent = canvas.current.parentElement.getBoundingClientRect() // 获取直接父元素<div id="parent">
      const dpr = window.devicePixelRatio || 1;
      const rect = { width: parent.width, height: parent.height };

      if (rect.width && rect.height) {
        canvas.current.width = rect.width * dpr;
        canvas.current.height = rect.height * dpr;
      }
    }
    initCanvas(); // 初始化canvas
    window.addEventListener("resize", initCanvas);
    return () => { // 组件卸载时移除事件监听
      window.removeEventListener("resize", initCanvas);
    }
  }, [canvas]);
  return canvasCtx;
}