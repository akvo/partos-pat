"use server";
import { getSession } from "./auth";

export const api = (method, url, payload = {}) =>
  new Promise(async (resolve, reject) => {
    const { token: authToken } = await getSession();
    const fetchProps = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    };
    if (typeof payload === "object" && Object.keys(payload).length) {
      fetchProps["body"] = JSON.stringify(payload);
    }
    fetch(`${process.env.WEBDOMAIN}/api/v1${url}`, fetchProps)
      .then((res) => res.json())
      .then((res) => resolve(res))
      .catch((err) => reject(err));
  });
