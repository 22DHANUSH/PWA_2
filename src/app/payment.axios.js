import axios from "axios";

const BASE_FUNCTION_URL = import.meta.env.VITE_API_PAYMENT_FUNCTION_URL;
const BASE_PAYMENT_URL = import.meta.env.VITE_API_PAYMENT_URL;

const payment_api_api = axios.create({
  baseURL: BASE_PAYMENT_URL,
  headers: { "Content-Type": "application/json" },
});
const payment_api = axios.create({
  baseURL: BASE_FUNCTION_URL,
  headers: { "Content-Type": "application/json" },
});

export { payment_api, payment_api_api };
