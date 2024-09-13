"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
class PubSubManager {
    constructor() {
        this.subscriptions = new Map();
        // this.redisClient = createClient();
        this.redisClient = (0, redis_1.createClient)({
            url: "redis://redis:6379",
        });
        this.redisClientCache = (0, redis_1.createClient)({
            url: "redis://redis:6379",
        });
        try {
            this.redisClient.on("error", (error) => {
                console.error(`Redis client error: ${error}`);
            });
            this.redisClientCache.on("error", (error) => {
                console.error(`Redis client error: ${error}`);
            });
        }
        catch (error) {
            console.error(`Error creating Redis client: ${error}`);
        }
        this.redisClient.connect();
        this.redisClientCache.connect();
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
            // console.log("Subscribing to Redis for ticker: ", ticker);
            try {
                this.redisClient.subscribe(ticker, (message) => {
                    this.handleMessage(ticker, message);
                });
            }
            catch (error) {
                console.error(`Error subscribing to Redis: ${error}`);
            }
        }
        console.log("Subscription added");
    }
    publish(ticker, message) {
        this.redisClient.publish(ticker, JSON.stringify(message));
    }
    handleMessage(ticker, message) {
        // console.log("Handling message");
        const subscribers = this.subscriptions.get(ticker);
        if (subscribers) {
            subscribers.forEach((ws) => {
                console.log("Sending message to subscriber");
                ws.send(message);
            });
        }
    }
    addDataToCache(symbol, data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Adding data to cache for ${symbol}`);
            try {
                yield this.redisClientCache.set(symbol, JSON.stringify(data));
                let cachedData = yield this.redisClientCache.get(symbol); // To confirm data was added
                console.log(`current cache after adding data: ${cachedData}`);
            }
            catch (error) {
                console.error("Redis error:", error);
            }
        });
    }
    sendDataFromCache(symbol, ws) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Sending data from cache for ${symbol}`);
            // console.log(`current cache: ${await this.redisClientCache.get(symbol)}`);
            try {
                const data = yield this.redisClientCache.get(symbol);
                console.log(`current cache: ${data}`);
                if (data) {
                    const parsedData = JSON.parse(data);
                    const stockObj = {};
                    stockObj[symbol] = parsedData;
                    ws.send(JSON.stringify(stockObj));
                }
            }
            catch (error) {
                console.error("Redis error when sending data:", error);
            }
        });
    }
}
exports.default = PubSubManager.getInstance();
