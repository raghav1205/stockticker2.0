import { useEffect } from "react";
import "./globals.css";
import WebSocket from "ws";
import StoreProvider from "./StoreProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
