import axios from "axios";
const CART_URL = import.meta.env.VITE_API_CART_URL;
const cart_api = axios.create({
  baseURL: CART_URL,
  headers: { "Content-Type": "application/json" },
});

export default cart_api;