import WebSocket from "ws";
import { createClient, RedisClientType } from "redis";

class PubSubManager {
  private static instance: PubSubManager;
  private subscriptions: Map<string, Set<WebSocket>>; // keeps mapping of ticker to ws connections
  private redisClient: RedisClientType;

  constructor() {
    this.subscriptions = new Map<string, Set<WebSocket>>();
    // this.redisClient = createClient();
    this.redisClient = createClient({
      url: 'redis://redis:6379'
  });
    this.redisClient.on("error", (error) => {
      console.error(`Error connecting to Redis: ${error}`);
    });
    this.redisClient.connect();
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

    console.log("Subscriptions: ", this.subscriptions);
  }

  public publish(ticker: string, message: any): void {
    this.redisClient.publish(ticker, JSON.stringify(message));
  }

  private handleMessage(ticker: string, message: any): void {
    // console.log("Handling message");
    const subscribers = this.subscriptions.get(ticker);
    if (subscribers) {
      subscribers.forEach((ws) => {
        // console.log("Sending message to subscriber");
        ws.send(message);
      });
    }
  }
}

export default PubSubManager.getInstance();
