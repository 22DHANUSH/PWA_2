import axios from "axios";
const PRODUCT_URL = import.meta.env.VITE_API_PRODUCT_URL;
const product_api = axios.create({
  baseURL: PRODUCT_URL,
  headers: { "Content-Type": "application/json" },
});
export default product_api;