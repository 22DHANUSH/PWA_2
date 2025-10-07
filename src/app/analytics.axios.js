import axios from "axios";
const ANALYTICS_URL = import.meta.env.VITE_API_ANALYTICS_URL;
const analytics_api = axios.create({
  baseURL: ANALYTICS_URL,
  headers: { "Content-Type": "application/json" },
});
export default analytics_api;
