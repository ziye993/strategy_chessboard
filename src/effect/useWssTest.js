import { useEffect, useRef } from "react";

export default function useWssTest() {
    const ws = useRef();
    useEffect(() => {
        if (ws.current) {
            return
        }
        console.log('wss');

        ws.current = new WebSocket('ws://192.168.0.107:3001/gameBattle');

        // 连接成功事件
        ws.current.onopen = () => {
            console.log('WebSocket连接已建立');
            // ws.send('Hello, server!'); // 发送消息到服务器
        };

        // 接收消息事件
        ws.current.onmessage = (event) => {
            console.log('收到消息:', event.data);
        };

        // 连接关闭事件
        ws.current.onclose = (event) => {
            console.log(event);
            console.log('连接已关闭', event.code, event.reason);
            // 可添加重连逻辑
        };


        // 错误处理
        ws.current.onerror = (error) => {
            console.error('WebSocket错误:', error);
        };

        // setInterval(() => {
        //     ws.current.send("111");
        // }, 2000)
        // return () => {

        //  ws.current.close() 
        // }
    }, []);
    return ws
}