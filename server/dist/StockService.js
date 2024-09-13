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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PubSubManager_1 = __importDefault(require("./PubSubManager"));
const axios_1 = __importDefault(require("axios"));
const node_cron_1 = __importDefault(require("node-cron"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const STOCK_API_URL = "https://api.twelvedata.com/";
const STOCK_API_KEY = process.env.STOCK_API_KEY;
const publishStockPrice = (symbols) => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    // Start date is midnight
    const start_date = `${formattedDate(today)}%2000:00%20AM`;
    // End date is the current time
    const end_date = `${formattedDate(today)}%20${formatAMPM(today)}`;
    console.log(start_date, end_date);
    try {
        const symbolString = symbols.join(",");
        const url = `${STOCK_API_URL}time_series?symbol=${symbolString}&interval=1min&format=JSON&start_date=${start_date}&end_date=${end_date}%&apikey=${STOCK_API_KEY}`;
        console.log("url", url);
        const response = yield axios_1.default.get(url);
        console.log("response", response.data);
        for (const symbol of symbols) {
            console.log(response.data[symbol]["values"]);
            PubSubManager_1.default.addDataToCache(symbol, response.data[symbol].values);
            console.log("publishing", symbol);
            PubSubManager_1.default.publish(symbol, response.data[symbol]);
        }
    }
    catch (error) {
        console.error(`Error fetching stock price: ${error}`);
    }
});
node_cron_1.default.schedule("* * * * *", () => {
    console.log("Running a task every  minute");
    publishStockPrice(stockList);
});
function formatAMPM(date) {
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // If hours equals 0, convert to 12 (for 12AM/PM)
    const strTime = `${hours}:${minutes}%20${ampm}`;
    return strTime;
}
const formattedDate = (date) => {
    return `${(date.getUTCMonth() + 1).toString().padStart(2, "0")}/${date
        .getUTCDate()
        .toString()
        .padStart(2, "0")}/${date.getUTCFullYear()}`;
};
const stockList = ["AAPL", "TSLA"];
