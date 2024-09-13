"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ws = new WebSocket("wss://st2.multiplayerbackend.tech");
    ws.onopen = () => {
      console.log("Connected to server");
      ws.send(JSON.stringify({ ticker: "AAPL", action: "subscribe" }));
      setLoading(false);
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

  if (loading) {
    return (
      <div className="p-5 pt-8 pb-8 dark:bg-[#121212] bg-[#ffff] w-full dark:text-white h-auto min-h-screen">
        <h1 className="text-4xl text-center mb-20">Stock Ticker</h1>
        <Skeleton />
      </div>
    );
  }

  return <div>hey</div>;
}

const Skeleton = () => {
  return (
    <div className="max-w-2xl mx-auto ">
      {[1, 2, 3, 4, 5, 6].map(() => {
        return (
          <div className="mx-auto grid grid-cols-3 md:grid-cols-3 font-semibold text-lg items-center justify-between px-8 py-2 rounded-md mt-5 shadow-xl dark:shadow-lg bg-[#ffff] dark:bg-[#1E1E1E] min-h-[5rem] animate-pulse">
            <h3>Stock</h3>
            <span>$0.00</span>
            <div className="max-w-[8rem]">
              {" "}
              {/* <Line data={{ labels: [], datasets: [] }} options={{}} /> */}
            </div>
          </div>
        );
      })}
    </div>
  );
};
