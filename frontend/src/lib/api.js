"use server";
import { getSession } from "./auth";

const fetchApi = (url, props) =>
  new Promise(async (resolve, reject) => {
    const { token: authToken } = await getSession();
    fetch(`${process.env.WEBDOMAIN}/api/v1/${url}`, {
      ...props,
      headers: {
        "Content-Type": "application/json",
        ...props?.headers,
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((res) => res.json())
      .then((res) => resolve(res))
      .catch((err) => reject(err));
  });

export const apiGet = (url) =>
  fetchApi(url, {
    method: "GET",
  });

export const apiPost = (url, payload) =>
  fetchApi(url, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const apiPut = (url, payload) =>
  fetchApi(url, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const apiDelete = (url) =>
  fetchApi(url, {
    method: "DELETE",
  });
