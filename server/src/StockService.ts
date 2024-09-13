import PubSubManager from "./PubSubManager";
import axios from "axios";
import cron from "node-cron";
import dotenv from "dotenv";

dotenv.config();

const STOCK_API_URL = "https://api.twelvedata.com/";
const STOCK_API_KEY = process.env.STOCK_API_KEY;

const publishStockPrice = async (symbols: string[]) => {
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
    const response = await axios.get(url);
    console.log("response", response.data);

    for (const symbol of symbols) {
    //   console.log(response.data[symbol]["values"])
      PubSubManager.addDataToCache(symbol, response.data[symbol].values);
      console.log("publishing", symbol);
      PubSubManager.publish(symbol, response.data[symbol]);
    }
  } catch (error) {
    console.error(`Error fetching stock price: ${error}`);
  }
};
cron.schedule("*/10 * * * *", () => {
  publishStockPrice(stockList);
});


function formatAMPM(date: Date) {
  let hours = date.getUTCHours(); 
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // If hours equals 0, convert to 12 (for 12AM/PM)
  const strTime = `${hours}:${minutes}%20${ampm}`;
  return strTime;
}

const formattedDate = (date: Date) => {
  return `${(date.getUTCMonth() + 1).toString().padStart(2, "0")}/${date
    .getUTCDate()
    .toString()
    .padStart(2, "0")}/${date.getUTCFullYear()}`;
};

const stockList = ["AAPL","TSLA"];
