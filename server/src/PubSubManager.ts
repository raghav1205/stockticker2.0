import WebSocket from "ws";
import { createClient, RedisClientType } from "redis";

interface StockValue {
  [key: string]: string;
}

interface StockObjInterface {
  [key: string]: {
    values: StockValue[];
  };
}

class PubSubManager {
  private static instance: PubSubManager;
  private subscriptions: Map<string, Set<WebSocket>>; // keeps mapping of ticker to ws connections
  private redisClient: RedisClientType;
  private redisClientCache: RedisClientType;

  constructor() {
    this.subscriptions = new Map<string, Set<WebSocket>>();
    // this.redisClient = createClient();

    this.redisClient = createClient({
      url: "redis://redis:6379",
    });

    this.redisClientCache = createClient({
      url: "redis://redis:6379",
    });

    try {
      this.redisClient.on("error", (error) => {
        console.error(`Redis client error: ${error}`);
      });
      this.redisClientCache.on("error", (error) => {
        console.error(`Redis client error: ${error}`);
      });
    } catch (error) {
      console.error(`Error creating Redis client: ${error}`);
    }

    this.redisClient.connect();
    this.redisClientCache.connect();
  }

  public static getInstance(): PubSubManager {
    if (!PubSubManager.instance) {
      PubSubManager.instance = new PubSubManager();
    }
    return PubSubManager.instance;
  }

  public addSubscription(ticker: string, ws: WebSocket): void {
    // create new set if ticker is not in subscriptions, add ws to the set
    if (!this.subscriptions.has(ticker)) {
      this.subscriptions.set(ticker, new Set<WebSocket>());
    }

    this.subscriptions.get(ticker)!.add(ws);

    // if this is the first subscriber to this ticker, subscribe to the ticker on Redis
    if (this.subscriptions.get(ticker)?.size === 1) {
      // console.log("Subscribing to Redis for ticker: ", ticker);
      try {
        this.redisClient.subscribe(ticker, (message) => {
          this.handleMessage(ticker, message);
        });
      } catch (error) {
        console.error(`Error subscribing to Redis: ${error}`);
      }
    }

    console.log("Subscription added",);
  }

  public publish(ticker: string, message: any): void {
    this.redisClient.publish(ticker, JSON.stringify(message));
  }

  private handleMessage(ticker: string, message: any): void {
    // console.log("Handling message");
    const subscribers = this.subscriptions.get(ticker);
    if (subscribers) {
      subscribers.forEach((ws) => {
        console.log("Sending message to subscriber");
        ws.send(message);
      });
    }
  }
  public async addDataToCache(symbol: string, data: any) {
    console.log(`Adding data to cache for ${symbol}`);
    try {
      await this.redisClientCache.set(symbol, JSON.stringify(data));
      let cachedData = await this.redisClientCache.get(symbol); // To confirm data was added
      console.log(`current cache after adding data: ${cachedData}`);
    } catch (error) {
      console.error("Redis error:", error);
    }
  }

  public async sendDataFromCache(symbol: string, ws: WebSocket) {
    console.log(`Sending data from cache for ${symbol}`);
    // console.log(`current cache: ${await this.redisClientCache.get(symbol)}`);
    try {
      const data = await this.redisClientCache.get(symbol);
      console.log(`current cache: ${data}`);
      if (data) {
        const parsedData = JSON.parse(data);
        const stockObj: StockObjInterface = {};
        stockObj[symbol] = parsedData;

        ws.send(JSON.stringify(stockObj));
      }
    } catch (error) {
      console.error("Redis error when sending data:", error);
    }
  }
}

export default PubSubManager.getInstance();
