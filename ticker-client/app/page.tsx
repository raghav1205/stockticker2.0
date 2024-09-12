"use client";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000");
    ws.onopen = () => {
      console.log("Connected to server");
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
  }, []);
  return <div>

    hey
  </div>;
}
