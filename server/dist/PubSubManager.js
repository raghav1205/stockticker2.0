"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
class PubSubManager {
    constructor() {
        this.subscriptions = new Map();
        this.redisClient = (0, redis_1.createClient)();
        this.redisClient.on("error", (error) => {
            console.error(`Error connecting to Redis: ${error}`);
        });
        this.redisClient.connect();
    }
    static getInstance() {
        if (!PubSubManager.instance) {
            PubSubManager.instance = new PubSubManager();
        }
        return PubSubManager.instance;
    }
    addSubscription(ticker, ws) {
        var _a;
        // create new set if ticker is not in subscriptions, add ws to the set
        if (!this.subscriptions.has(ticker)) {
            this.subscriptions.set(ticker, new Set());
        }
        this.subscriptions.get(ticker).add(ws);
        // if this is the first subscriber to this ticker, subscribe to the ticker on Redis
        if (((_a = this.subscriptions.get(ticker)) === null || _a === void 0 ? void 0 : _a.size) === 1) {
            console.log("Subscribing to Redis for ticker: ", ticker);
            try {
                this.redisClient.subscribe(ticker, (message) => {
                    this.handleMessage(ticker, message);
                });
            }
            catch (error) {
                console.error(`Error subscribing to Redis: ${error}`);
            }
        }
        console.log("Subscriptions: ", this.subscriptions);
    }
    publish(ticker, message) {
        console.log("Publishing message to Redis");
        this.redisClient.publish(ticker, JSON.stringify(message));
    }
    handleMessage(ticker, message) {
        console.log("Handling message");
        const subscribers = this.subscriptions.get(ticker);
        if (subscribers) {
            subscribers.forEach((ws) => {
                console.log("Sending message to subscriber");
                ws.send(message);
            });
        }
    }
}
exports.default = PubSubManager.getInstance();
