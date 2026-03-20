import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';

export const getBaseInstance = (baseUrl: string) =>
  axios.create({
    baseURL: baseUrl,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

const getAuthInstance = (baseUrl: string) => {
  const TOKEN_TYPE = 'Bearer';

  const axiosAuthInstance = getBaseInstance(baseUrl);

  axiosAuthInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `${TOKEN_TYPE} ${token}`;

    return config;
  });

  axiosAuthInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.replace('/login');
        return new Promise(() => {});
      }
      return Promise.reject(error);
    }
  );

  return axiosAuthInstance;
};

export const authAxios = getAuthInstance(API_URL);

export const anonymousAxios = getBaseInstance(API_URL);
