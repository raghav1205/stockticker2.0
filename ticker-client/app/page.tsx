"use client";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const ws = new WebSocket("wss://st2.multiplayerbackend.tech");
    ws.onopen = () => {
      console.log("Connected to server");
      ws.send(JSON.stringify({ ticker: "AAPL", action: "subscribe" }));
    };
    ws.onmessage = (msg) => {
      console.log(msg.data);
    };
    ws.onerror = (error) => {
      console.log(error);
    };
    ws.onclose = () => {
      console.log("Connection closed");
    };
    setInterval(() => {
      ws.send(JSON.stringify({ type: "keep-alive", timestamp: Date.now() }));
    }, 30000);
  }, []);
  return <div>hey</div>;
}
