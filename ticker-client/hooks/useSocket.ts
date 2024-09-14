import { useEffect, useState } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { setData } from "@/lib/features/dataSlice";

const stockList = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'];


const useSocket = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();
  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_BACKEND_URL as string);
    ws.onopen = () => {
      console.log("Connected to server");
      // ws.send(JSON.stringify({ ticker: "AAPL", action: "subscribe" }));
      stockList.forEach((ticker) => {
        ws.send(JSON.stringify({ ticker, action: "subscribe" }));
      })
      setLoading(false);
    };
    ws.onmessage = (msg) => {
      dispatch(setData(JSON.parse(msg.data)));
      console.log("setting data");
      // console.log(msg.data);
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
