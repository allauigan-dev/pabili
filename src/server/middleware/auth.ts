import { getAuth } from "../lib/auth";
import type { Context, Next } from "hono";

export const authMiddleware = async (c: Context, next: Next) => {
    const auth = getAuth(c.env);
    const headers = c.req.raw.headers;
    const cookie = headers.get("cookie");

    console.log(`[AuthMiddleware] URL: ${c.req.url}, HasCookie: ${!!cookie}`);
    if (cookie) {
        console.log(`[AuthMiddleware] Cookie: ${cookie.substring(0, 100)}...`);
    }

    const session = await auth.api.getSession({ headers });

    if (!session) {
        console.log(`[AuthMiddleware] No session found`);
        c.set("user", null);
        c.set("session", null);
        return next();
    }

    console.log(`[AuthMiddleware] Session found for user: ${session.user.id}`);
    c.set("user", session.user);
    c.set("session", session.session);
    return next();
};

export const requireAuth = async (c: Context, next: Next) => {
    const user = c.get("user");
    if (!user) {
        return c.json({ success: false, error: "Unauthorized" }, 401);
    }
    return next();
};
