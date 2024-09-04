import axios from "axios";

export const config = {
  baseURL: "/api/v1/",
  headers: {
    "Content-Type": "application/json",
  },
};

const API = () => {
  const getConfig = () => {
    let current = config;
    if (api.baseURL) {
      current = {
        ...config,
        baseURL: api.baseURL,
      };
    }
    return api?.token
      ? {
          ...current,
          headers: { ...config.headers, Authorization: `Bearer ${api.token}` },
        }
      : current;
  };
  return {
    get: (url, params = {}) => {
      return new Promise((resolve, reject) => {
        axios({ url, ...getConfig(), ...params })
          .then((res) => resolve(res))
          .catch((err) => reject(err.response));
      });
    },
    post: (url, data, params = {}) => {
      return new Promise((resolve, reject) => {
        axios({ url, method: "POST", data, ...getConfig(), ...params })
          .then((res) => resolve(res))
          .catch((err) => reject(err.response));
      });
    },
    put: (url, data, params) => {
      return new Promise((resolve, reject) => {
        axios({ url, method: "PUT", data, ...getConfig(), ...params })
          .then((res) => resolve(res))
          .catch((err) => reject(err.response));
      });
    },
    patch: (url, data, params) => {
      return new Promise((resolve, reject) => {
        axios({ url, method: "PATCH", data, ...getConfig(), ...params })
          .then((res) => resolve(res))
          .catch((err) => reject(err.response));
      });
    },
    delete: (url) => {
      return new Promise((resolve, reject) => {
        axios({ url, method: "DELETE", ...getConfig() })
          .then((res) => resolve(res))
          .catch((err) => reject(err.response));
      });
    },
    setToken: (token) => {
      api.token = token;
    },
    setServerURL: (serverURL) => {
      api.baseURL = serverURL;
    },
    getConfig,
  };
};

const api = API();

export default api;
