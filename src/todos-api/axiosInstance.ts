import Axios, { type AxiosRequestConfig } from "axios";

const axiosInstance = Axios.create({ baseURL: import.meta.env.VITE_TODOS_API_URL });

// NOTE: Meant to be used by orval generated client
export const fetch = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> =>
    axiosInstance({
        ...config,
        ...options
    }).then(({ data }) => data);
