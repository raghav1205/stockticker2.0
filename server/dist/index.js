"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const http_1 = __importDefault(require("http"));
const PubSubManager_1 = __importDefault(require("./PubSubManager"));
const server = http_1.default.createServer((req, res) => {
    console.log("I am connected");
    console.log(req);
    res.end("I am connected");
});
const wss = new ws_1.default.Server({ server });
const pubSubManager = PubSubManager_1.default;
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
}
catch (error) {
    console.log(error);
}
server.listen(8000, () => {
    console.log("Server is running on port 8000");
});
