import ky from "ky";

export const api = ky.create({
  baseUrl: `https://api.traffix.pro/public`,
  headers: {
    "Content-Type": "application/json",
  },
});
