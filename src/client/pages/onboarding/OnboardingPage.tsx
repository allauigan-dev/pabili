import { useState } from "react";
import { authClient } from "../../lib/auth-client";
import { useNavigate } from "react-router-dom";
import { Loader2, Building2, ArrowRight } from "lucide-react";

export function OnboardingPage() {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleCreateOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await authClient.organization.create({
                name,
                slug,
            });

            if (result.error) {
                setError(result.error.message || "Failed to create organization");
                setLoading(false);
                return;
            }

            if (result.data) {
                // Set the newly created organization as active
                const setActiveResult = await authClient.organization.setActive({
                    organizationId: result.data.id
                });

                if (setActiveResult.error) {
                    setError(setActiveResult.error.message || "Failed to activate organization");
                    setLoading(false);
                    return;
                }

                // Small delay to ensure session state is updated
                await new Promise(resolve => setTimeout(resolve, 100));

                // Navigate to dashboard
                navigate("/", { replace: true });
            }
        } catch (err) {
            setError("An unexpected error occurred");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mb-4">
                        <Building2 size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Create Organization</h1>
                    <p className="text-slate-500 mt-2">Set up your workspace to get started</p>
                </div>

                <form onSubmit={handleCreateOrg} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-slate-700">
                            Organization Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                            }}
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="e.g. My Store"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="slug" className="text-sm font-medium text-slate-700">
                            Organization Slug
                        </label>
                        <input
                            type="text"
                            id="slug"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-sm"
                            placeholder="e.g. my-store"
                        />
                        <p className="text-xs text-slate-400">This will be used in your URL</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Create Organization
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
