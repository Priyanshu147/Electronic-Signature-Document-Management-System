import axios from "axios";
import { API_BASE_URL } from "../constants/apiEndpoints";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "An unexpected error occurred.";
    return Promise.reject(new Error(message));
  }
);

export default api;
