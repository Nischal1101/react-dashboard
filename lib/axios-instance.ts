import axios, { AxiosError } from "axios";
import { toast } from "sonner";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    let message = "Something went wrong";
    if (error.response) {
      if (error.response.data) {
        const data = error.response.data as {
          message?: string;
          error?: string;
        };
        if (data.message) {
          message = data.message;
        } else if (data.error) {
          message = data.error;
        } else {
          switch (error.response.status) {
            case 500:
              message = "Internal server error";
              break;
            case 401:
              message = "Unauthorized";
              break;
            case 403:
              message = "Forbidden";
              break;
            case 404:
              message = "Not found";
              break;
            default:
              message = "Something went wrong";
              break;
          }
        }
      }
    } else if (error.request) {
      message = "No response received from server";
    } else {
      message = error.message;
    }

    toast.error(message, { duration: 9000 });

    return Promise.reject({ ...error, message });
  },
);
