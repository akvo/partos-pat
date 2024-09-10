"use server";
import { getSession } from "./auth";

export const api = (method, url, payload = {}) =>
  new Promise(async (resolve, reject) => {
    const { token: authToken } = await getSession();
    fetch(`${process.env.WEBDOMAIN}/api/v1${url}`, {
      method,
      headers:
        typeof payload === "object" && Object.keys(payload).length
          ? {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
              body: JSON.stringify(payload),
            }
          : {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
    })
      .then((res) => res.json())
      .then((res) => resolve(res))
      .catch((err) => reject(err));
  });
