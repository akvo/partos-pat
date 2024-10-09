"use server";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.NEXT_AUTH_SECRET_KEY || "secret";
const key = new TextEncoder().encode(secretKey);
const protectedRoutes = ["dashboard"];
const authRoutes = ["login", "register"];

export const encrypt = async ({ expirationTime, ...payload }) => {
  const expirationDate = new Date(expirationTime);
  const currentTime = new Date();
  const timeDifference = expirationDate - currentTime;

  // Convert to hours
  const hours = Math.floor(
    (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${hours} hours from now`)
    .sign(key);
};

export const decrypt = async (input) => {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return {};
  }
};

export const signIn = async (formData) => {
  try {
    const req = await fetch(
      `${process.env.WEBDOMAIN}/api/v1/users/login?format=json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    const { user, token, expiration_time: expirationTime } = await req.json();
    if (req.ok) {
      const expires = new Date(expirationTime);
      // Create the session
      const currentUser = await encrypt({
        user: { id: user?.id, email: user?.email },
        token,
        expirationTime,
      });

      // Save the session in a cookie
      cookies().set("currentUser", currentUser, { expires, httpOnly: true });
      cookies().set(
        "profile",
        JSON.stringify({
          full_name: user?.full_name,
          gender: user?.gender,
          country: user?.country,
          account_purpose: user?.account_purpose,
          is_superuser: user?.is_superuser
        }),
        { expires, httpOnly: true }
      );
      return { message: "success", status: 200 };
    } else {
      return { message: "invalidLogin", status: 401 };
    }
  } catch {
    throw new Error("500");
  }
};

export const signOut = async () => {
  // Destroy the session
  cookies().set("currentUser", "", { expires: new Date(0) });
  cookies().set("profile", "", { expires: new Date(0) });
};

export const getSession = async () => {
  const session = cookies().get("currentUser")?.value;
  if (!session) return null;
  return await decrypt(session);
};

export const updateProfile = (payload) => {
  cookies().set("profile", JSON.stringify(payload));
};

export const getProfile = () => {
  try {
    return JSON.parse(cookies().get("profile").value);
  } catch {
    return { full_name: "" };
  }
};

export const OptimisticCheck = async (locale, pathName, request) => {
  const session = request.cookies.get("currentUser")?.value;
  const [prefixPath] = pathName.split("/");
  if (
    !session &&
    locale &&
    (protectedRoutes.includes(prefixPath) || protectedRoutes.includes(pathName))
  ) {
    request.nextUrl.pathname = `/${locale}/login`;
  }

  if (!session) return true;

  if (locale && authRoutes.includes(pathName)) {
    request.nextUrl.pathname = `/${locale}/dashboard`;
  }
  // check expires
  const { token: authToken } = await decrypt(session);
  if (!authToken) {
    return false;
  }

  const req = await fetch(
    `${process.env.WEBDOMAIN}/api/v1/users/me?format=json`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    }
  );
  return req.ok;
};
