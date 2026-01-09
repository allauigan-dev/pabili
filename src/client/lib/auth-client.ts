import { createAuthClient } from "better-auth/react";
import { organizationClient, inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: window.location.origin, // Required for Better Auth to know where to send API requests
    plugins: [
        organizationClient(),
        inferAdditionalFields({
            user: {
                gender: {
                    type: "string",
                    required: false,
                },
            },
        }),
    ],
});

export const { signIn, signOut, useSession, useActiveOrganization } = authClient;
