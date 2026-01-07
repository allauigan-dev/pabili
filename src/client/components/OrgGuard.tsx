import { useEffect, useState } from "react";
import { useActiveOrganization, useSession, authClient } from "../lib/auth-client";
import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";

export function OrgGuard() {
    const { data: session, isPending: isSessionPending } = useSession();
    const { data: activeOrg, isPending: isOrgPending } = useActiveOrganization();
    const [isCheckingOrgs, setIsCheckingOrgs] = useState(true);
    const [hasOrgs, setHasOrgs] = useState<boolean | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 3;

    useEffect(() => {
        const checkAndSetOrg = async () => {
            // If already have an active org, no need to check
            if (activeOrg) {
                setHasOrgs(true);
                setIsCheckingOrgs(false);
                return;
            }

            // If session not ready yet, wait
            if (isSessionPending || isOrgPending) {
                return;
            }

            // If no session, no need to check orgs
            if (!session) {
                setIsCheckingOrgs(false);
                return;
            }

            try {
                // Fetch user's organizations
                const result = await authClient.organization.list();
                const orgs = result.data || [];

                if (orgs.length > 0) {
                    // User has orgs, set the first one as active
                    await authClient.organization.setActive({
                        organizationId: orgs[0].id
                    });
                    setHasOrgs(true);
                    // Reload to refresh the active org state
                    window.location.reload();
                } else if (retryCount < MAX_RETRIES) {
                    // Organization might not be created yet (race condition with databaseHook)
                    // Wait a bit and retry
                    console.log(`[OrgGuard] No orgs found, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
                    setTimeout(() => {
                        setRetryCount(prev => prev + 1);
                    }, 1000);
                } else {
                    // After retries, user truly has no organizations
                    // This is a fallback - should rarely happen with auto-creation
                    console.warn("[OrgGuard] No orgs after retries, redirecting to create org");
                    setHasOrgs(false);
                    setIsCheckingOrgs(false);
                }
            } catch (error) {
                console.error("Error checking organizations:", error);
                setHasOrgs(false);
                setIsCheckingOrgs(false);
            }
        };

        checkAndSetOrg();
    }, [session, activeOrg, isSessionPending, isOrgPending, retryCount]);

    // Show loading while checking session, org, or fetching orgs list
    if (isSessionPending || isOrgPending || isCheckingOrgs) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground font-medium animate-pulse">
                    {retryCount > 0 ? "Setting up your workspace..." : "Loading..."}
                </p>
            </div>
        );
    }

    // If not logged in, redirect to login
    if (!session) {
        return <Navigate to="/login" replace />;
    }

    // If logged in but no organizations after retries, redirect to create org page
    // This is a fallback for edge cases where auto-creation failed
    if (!activeOrg && hasOrgs === false) {
        return <Navigate to="/organizations/new" replace />;
    }

    return <Outlet />;
}
