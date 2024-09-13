import { useEffect, useState } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { setData } from "@/lib/features/dataSlice";
const useSocket = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();
  useEffect(() => {
    const ws = new WebSocket("wss://st2.multiplayerbackend.tech");
    ws.onopen = () => {
      console.log("Connected to server");
      ws.send(JSON.stringify({ ticker: "AAPL", action: "subscribe" }));
      setLoading(false);
    };
    ws.onmessage = (msg) => {
      dispatch(setData(JSON.parse(msg.data)));
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

  return { loading };
};

export default useSocket;
