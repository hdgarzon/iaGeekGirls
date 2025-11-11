import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://iageekgirls-production.up.railway.app/",
  timeout: 15000
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        "API error",
        error.response.status,
        error.response.data?.message || error.message
      );
    } else {
      console.error("Network or CORS error", error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;

