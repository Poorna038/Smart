import axios from "axios";

const API = axios.create({
  baseURL: "https://smart-gqig.onrender.com",
});

export default API;