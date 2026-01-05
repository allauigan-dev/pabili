import { getAuth } from "../lib/auth";
import type { Context, Next } from "hono";

export const requireOrganization = async (c: Context, next: Next) => {
    const auth = getAuth(c.env);
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session?.session?.activeOrganizationId) {
        return c.json({ success: false, error: "No organization selected" }, 403);
    }

    c.set("organizationId", session.session.activeOrganizationId);
    return next();
};
