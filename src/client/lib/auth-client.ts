import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: window.location.origin, // Required for Better Auth to know where to send API requests
    plugins: [organizationClient()],
});

export const { signIn, signOut, useSession, useActiveOrganization } = authClient;
