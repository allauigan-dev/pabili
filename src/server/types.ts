import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

export type AppEnv = {
    Bindings: {
        DB: D1Database;
        BUCKET: R2Bucket;
        BETTER_AUTH_SECRET: string;
        BETTER_AUTH_URL: string;
        GOOGLE_CLIENT_ID: string;
        GOOGLE_CLIENT_SECRET: string;
        FACEBOOK_CLIENT_ID: string;
        FACEBOOK_CLIENT_SECRET: string;
    };
    Variables: {
        user: any;
        session: any;
        organizationId: string;
    };
};
