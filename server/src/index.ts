import WebSocket from "ws";
import http from "http";
import PubSubManager from "./PubSubManager";

const server = http.createServer((req, res) => {
    console.log("I am connected");
    console.log(req)
  res.end("I am connected");
});

const wss = new WebSocket.Server({ server });
const pubSubManager = PubSubManager

try {
  wss.on("connection", (ws, req) => {
    ws.on("message", (msg) => {

      const parsedMsg = JSON.parse(msg.toString());
      
      if (parsedMsg.action === 'subscribe') {
        pubSubManager.addSubscription(parsedMsg.ticker, ws);
        
      }

      ws.send(`You said: ${msg}`);
    });
  });
} catch (error) {
  console.log(error);
}

server.listen(8000, () => {
  console.log("Server is running on port 8000");
});
