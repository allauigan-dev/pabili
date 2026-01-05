import type { D1Database } from "@cloudflare/workers-types";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import * as schema from "../db/schema";
import { createDb } from "../db";

export const getAuth = (env: { DB: D1Database; BETTER_AUTH_SECRET: string; BETTER_AUTH_URL: string; GOOGLE_CLIENT_ID: string; GOOGLE_CLIENT_SECRET: string; FACEBOOK_CLIENT_ID: string; FACEBOOK_CLIENT_SECRET: string }) => {
    const db = createDb(env.DB);
    console.log("[Auth Config] BETTER_AUTH_URL:", env.BETTER_AUTH_URL);
    return betterAuth({
        baseURL: env.BETTER_AUTH_URL,
        secret: env.BETTER_AUTH_SECRET,
        trustedOrigins: [
            env.BETTER_AUTH_URL,
            "http://localhost:5173", // Vite dev server
        ],

        database: drizzleAdapter(db, {
            provider: "sqlite",
            schema: {
                ...schema,
            },
        }),

        // Social-only auth (no email/password)
        emailAndPassword: {
            enabled: false,
        },

        socialProviders: {
            google: {
                clientId: env.GOOGLE_CLIENT_ID,
                clientSecret: env.GOOGLE_CLIENT_SECRET,
                prompt: "select_account",
            },
            facebook: {
                clientId: env.FACEBOOK_CLIENT_ID,
                clientSecret: env.FACEBOOK_CLIENT_SECRET,
            },
        },

        plugins: [
            organization({
                allowUserToCreateOrganization: true,
            }),
        ],

        advanced: {
            useSecureCookies: false, // Help with local dev issues
            defaultCookieAttributes: {
                sameSite: "lax", // Required for OAuth redirects
                httpOnly: true,
                path: "/",
            },
        },
    });
};

export type Auth = ReturnType<typeof getAuth>;
