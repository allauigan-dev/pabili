import React, { useState } from 'react';
import { Camera, Loader2, Check } from 'lucide-react';
import { useSession, authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { genderOptions, getGenderImagePaths, type Gender } from '@/hooks/useGenderIcon';

export const ProfileSection: React.FC = () => {
    const { data: session, isPending: sessionLoading } = useSession();
    const user = session?.user;

    const [name, setName] = useState(user?.name || '');
    const [gender, setGender] = useState<Gender>((user as { gender?: Gender })?.gender);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const genderImages = getGenderImagePaths(gender);

    // Sync state when user data loads
    React.useEffect(() => {
        if (user && !isEditing) {
            setName(user.name || '');
            setGender((user as { gender?: Gender }).gender);
        }
    }, [user, isEditing]);

    const handleSave = async () => {
        if (!name.trim()) {
            setError('Name cannot be empty');
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            await authClient.updateUser({
                name: name.trim(),
                gender: gender,
            });
            setIsEditing(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        } catch (err) {
            setError('Failed to update profile. Please try again.');
            console.error('Profile update error:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setName(user?.name || '');
        setGender((user as { gender?: Gender })?.gender);
        setIsEditing(false);
        setError(null);
    };

    if (sessionLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Profile Photo */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-muted overflow-hidden border-2 border-border/50">
                        {user?.image ? (
                            <img
                                src={user.image}
                                alt={user.name || 'Profile'}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <img
                                src={genderImages.large}
                                alt={gender === 'female' ? 'Female avatar' : 'Male avatar'}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                    <button
                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                        onClick={() => {
                            // TODO: Implement photo upload
                            alert('Photo upload coming soon!');
                        }}
                    >
                        <Camera className="h-4 w-4" />
                    </button>
                </div>
                <div>
                    <h3 className="text-base font-semibold text-foreground">{user?.name || 'User'}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
                <Label htmlFor="display-name" className="text-sm font-semibold">
                    Display Name
                </Label>
                <div className="flex gap-2">
                    <Input
                        id="display-name"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (!isEditing) setIsEditing(true);
                            setError(null);
                        }}
                        placeholder="Your name"
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
                {error && !gender && (
                    <p className="text-xs text-destructive">{error}</p>
                )}
            </div>

            {/* Gender Selection */}
            <div className="space-y-2">
                <Label className="text-sm font-semibold">
                    Gender
                </Label>
                <div className="flex gap-3">
                    {genderOptions.map((option) => {
                        const isSelected = gender === option.value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    setGender(option.value);
                                    if (!isEditing) setIsEditing(true);
                                }}
                                className={cn(
                                    "flex-1 p-3 rounded-lg border-2 transition-all",
                                    "flex items-center justify-center gap-2",
                                    "hover:border-primary/50",
                                    isSelected
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border/50 bg-muted/30 text-muted-foreground"
                                )}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
                <Label className="text-sm font-semibold text-muted-foreground">
                    Email Address
                </Label>
                <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                    <p className="text-sm text-foreground">{user?.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Email is managed by your connected account
                    </p>
                </div>
            </div>
        </div>
    );
};
