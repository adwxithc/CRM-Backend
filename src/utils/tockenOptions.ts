import type { CookieOptions } from "express";

const accessCookieExpireHours = Number.parseInt(process.env.ACCESS_COOKIE_EXPIRE_HOURS || "1", 10);
const refreshCookieExpireDays = Number.parseInt(process.env.REFRESH_COOKIE_EXPIRE_DAYS || "30", 10);

export const accessTokenOptions: CookieOptions = {
    maxAge: accessCookieExpireHours * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: process.env.NODE_ENV === 'production',
};
export const refreshTokenOptions: CookieOptions = {
   maxAge: refreshCookieExpireDays * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: process.env.NODE_ENV === 'production',
};