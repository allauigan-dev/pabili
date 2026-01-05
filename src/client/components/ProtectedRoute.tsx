import { useSession } from "../lib/auth-client";
import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";

export function ProtectedRoute() {
    const { data: session, isPending } = useSession();

    if (isPending) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium animate-pulse">Checking session...</p>
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
