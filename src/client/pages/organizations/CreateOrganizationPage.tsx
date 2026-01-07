import { useState } from "react";
import { authClient } from "../../lib/auth-client";
import { useNavigate } from "react-router-dom";
import { Loader2, Building2, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";

/**
 * CreateOrganizationPage - For creating additional organizations
 * 
 * This page is used as a fallback when auto-creation fails, or when users
 * want to create additional organizations (subject to subscription tier limits).
 */
export function CreateOrganizationPage() {
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

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-surface-light dark:bg-surface-dark rounded-2xl shadow-soft p-8 border border-border/50">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-2xl mb-4">
                        <Building2 size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Create Organization</h1>
                    <p className="text-muted-foreground mt-2">Set up a new workspace</p>
                </div>

                <form onSubmit={handleCreateOrg} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/20">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-foreground">
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
                            className="w-full px-4 py-3 bg-secondary/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                            placeholder="e.g. My Store"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="slug" className="text-sm font-medium text-foreground">
                            Organization Slug
                        </label>
                        <input
                            type="text"
                            id="slug"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-secondary/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono text-sm text-foreground placeholder:text-muted-foreground"
                            placeholder="e.g. my-store"
                        />
                        <p className="text-xs text-muted-foreground">This will be used in URLs</p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleBack}
                            className="flex-1"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Create
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
