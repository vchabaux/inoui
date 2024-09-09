import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_BACKEND_URL + "/api",
  withCredentials: true,
  headers: {
    "Accept-Language": "fr",
  },
});

api.interceptors.response.use(
  (response) => response, // Simply return the response here
  /**
   * Handle Error below
   */
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error

    /**
     * @TODO Check 401 and reload page
     */
    return Promise.reject(error);
  }
);

export { api };
