import type { D1Database } from "@cloudflare/workers-types";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization as organizationPlugin } from "better-auth/plugins";
import * as schema from "../db/schema";
import { createDb } from "../db";

export const getAuth = (env: { DB: D1Database; BETTER_AUTH_SECRET: string; BETTER_AUTH_URL: string; GOOGLE_CLIENT_ID: string; GOOGLE_CLIENT_SECRET: string; FACEBOOK_CLIENT_ID: string; FACEBOOK_CLIENT_SECRET: string }) => {
    const db = createDb(env.DB);
    const isProduction = env.BETTER_AUTH_URL?.startsWith("https://");
    console.log("[Auth Config] BETTER_AUTH_URL:", env.BETTER_AUTH_URL, "isProduction:", isProduction);

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
            organizationPlugin({
                allowUserToCreateOrganization: true,
            }),
        ],

        // Auto-create organization on user signup
        databaseHooks: {
            user: {
                create: {
                    after: async (user) => {
                        try {
                            // Extract first name from full name
                            const firstName = user.name?.split(' ')[0] || 'My';
                            const orgName = `${firstName}'s PaOrders`;

                            // Generate unique slug: firstname-paorders-shortid
                            const slugBase = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
                            const shortId = user.id.slice(0, 8);
                            const slug = `${slugBase}-paorders-${shortId}`;

                            // Generate IDs
                            const orgId = crypto.randomUUID();
                            const memberId = crypto.randomUUID();
                            const now = new Date();

                            // Direct DB insert for organization (bypasses API transaction issues)
                            await db.insert(schema.organization).values({
                                id: orgId,
                                name: orgName,
                                slug: slug,
                                createdAt: now,
                                createdBy: user.id,
                            });

                            // Insert member record (owner role)
                            await db.insert(schema.member).values({
                                id: memberId,
                                organizationId: orgId,
                                userId: user.id,
                                role: 'owner',
                                createdAt: now,
                            });

                            console.log(`[Auth] Auto-created org "${orgName}" for user ${user.id}`);
                        } catch (error) {
                            // Log but don't throw - user creation should still succeed
                            console.error('[Auth] Failed to auto-create organization:', error);
                        }
                    }
                }
            }
        },

        advanced: {
            useSecureCookies: isProduction, // Use secure cookies for HTTPS
            defaultCookieAttributes: {
                sameSite: "lax", // Required for OAuth redirects
                httpOnly: true,
                path: "/",
                secure: isProduction, // Secure flag for HTTPS
            },
        },
    });
};

export type Auth = ReturnType<typeof getAuth>;
