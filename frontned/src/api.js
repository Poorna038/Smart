import axios from "axios";

export const API_BASE_URL = "https://smart-gqig.onrender.com";

const API = axios.create({
  baseURL: API_BASE_URL,
});

export default API;