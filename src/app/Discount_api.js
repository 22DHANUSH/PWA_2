import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_DISCOUNT_URL;
const Discount_api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export default Discount_api;
