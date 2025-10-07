import axios from "axios";
 
const BASE_URL = import.meta.env.VITE_API_DISCOUNT_FUNCTION_URL;
 
const Discount_Function_api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});
 
export default Discount_Function_api;