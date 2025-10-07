import axios from "axios";
const USER_URL = import.meta.env.VITE_API_USER_URL;
const user_api = axios.create({
  baseURL: USER_URL,
  headers: { "Content-Type": "application/json" },
});
 
export default user_api;