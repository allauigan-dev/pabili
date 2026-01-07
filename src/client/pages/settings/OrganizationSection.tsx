import React, { useState } from 'react';
import { Building2, Users, Crown, UserCheck, Loader2, Check, Copy } from 'lucide-react';
import { useActiveOrganization, authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const OrganizationSection: React.FC = () => {
    const { data: activeOrg, isPending: orgLoading } = useActiveOrganization();

    const [name, setName] = useState(activeOrg?.name || '');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Sync name when org data loads
    React.useEffect(() => {
        if (activeOrg?.name && !isEditing) {
            setName(activeOrg.name);
        }
    }, [activeOrg?.name, isEditing]);

    const handleSave = async () => {
        if (!name.trim()) {
            setError('Organization name cannot be empty');
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            await authClient.organization.update({
                data: { name: name.trim() },
            });
            setIsEditing(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        } catch (err) {
            setError('Failed to update organization. Please try again.');
            console.error('Organization update error:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setName(activeOrg?.name || '');
        setIsEditing(false);
        setError(null);
    };

    const handleCopySlug = () => {
        if (activeOrg?.slug) {
            navigator.clipboard.writeText(activeOrg.slug);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (orgLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!activeOrg) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No active organization</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Organization Info Card */}
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden border border-border/50">
                    {activeOrg.logo ? (
                        <img
                            src={activeOrg.logo}
                            alt={activeOrg.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Building2 className="h-7 w-7 text-primary" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-foreground truncate">{activeOrg.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                            <Crown className="h-3 w-3 mr-1" />
                            Owner
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Organization Name */}
            <div className="space-y-2">
                <Label htmlFor="org-name" className="text-sm font-semibold">
                    Organization Name
                </Label>
                <div className="flex gap-2">
                    <Input
                        id="org-name"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (!isEditing) setIsEditing(true);
                            setError(null);
                        }}
                        placeholder="Organization name"
                        className={cn(
                            "flex-1",
                            error && "border-destructive focus-visible:ring-destructive"
                        )}
                    />
                    {isEditing && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancel}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={isSaving || !name.trim()}
                            >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : saveSuccess ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    'Save'
                                )}
                            </Button>
                        </div>
                    )}
                </div>
                {error && (
                    <p className="text-xs text-destructive">{error}</p>
                )}
            </div>

            {/* Organization Slug (read-only) */}
            <div className="space-y-2">
                <Label className="text-sm font-semibold text-muted-foreground">
                    Organization ID
                </Label>
                <div className="flex items-center gap-2">
                    <div className="flex-1 p-3 bg-muted/30 rounded-lg border border-border/50 font-mono text-sm text-foreground">
                        {activeOrg.slug || activeOrg.id?.slice(0, 8)}
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopySlug}
                        className="h-10 w-10"
                    >
                        {copied ? (
                            <Check className="h-4 w-4 text-green-500" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Members Preview */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Team Members</Label>
                    <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {activeOrg.members?.length || 1} member{(activeOrg.members?.length || 1) > 1 ? 's' : ''}
                    </Badge>
                </div>
                <div className="p-4 bg-muted/20 rounded-xl border border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">You</p>
                            <p className="text-xs text-muted-foreground">Owner</p>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 italic">
                        Team member management coming soon
                    </p>
                </div>
            </div>
        </div>
    );
};
