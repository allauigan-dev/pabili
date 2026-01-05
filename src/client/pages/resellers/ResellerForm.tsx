import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    User,
    Mail,
    Phone,
    Loader2,
    AlertCircle,
    UserPlus
} from 'lucide-react';
import { useReseller, useResellerMutations } from '@/hooks/useResellers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { CreateResellerDto } from '@/lib/types';

export const ResellerForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const { data: reseller, loading: loadingReseller } = useReseller(Number(id));
    const { createAction, updateAction, loading: mutationLoading, error } = useResellerMutations();

    const [formData, setFormData] = useState<CreateResellerDto>({
        resellerName: '',
        resellerEmail: '',
        resellerPhone: '',
    });

    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        if (isEdit && reseller) {
            setFormData({
                resellerName: reseller.resellerName,
                resellerEmail: reseller.resellerEmail,
                resellerPhone: reseller.resellerPhone,
            });
        }
    }, [isEdit, reseller]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        let result;
        if (isEdit) {
            result = await updateAction({ id: Number(id), data: formData });
        } else {
            result = await createAction(formData);
        }

        if (result) {
            navigate('/resellers');
        } else {
            // Error is handled by the hook and will be returned via the 'error' prop
        }
    };

    if (isEdit && loadingReseller) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading reseller data...</p>
            </div>
        );
    }

    return (
        <div className="bg-background text-foreground font-sans min-h-screen pb-24">
            {/* Header */}
            <header className="sticky top-0 w-full z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 transition-all">
                <div className="max-w-5xl mx-auto h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/resellers')}
                            className="text-muted-foreground hover:text-primary transition-all flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary/80 active:scale-95 group"
                            type="button"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            <span className="text-sm font-bold">Back to Resellers</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-md md:max-w-2xl mx-auto px-4 pt-8 md:pt-12">
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-foreground tracking-tight mb-2 uppercase">
                        {isEdit ? 'Update Profile' : 'Enroll Partner'}
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium">
                        {isEdit ? 'Update profile information for this business partner.' : 'Onboard a new reseller to your pasabuy network.'}
                    </p>
                </div>

                {(error || localError) && (
                    <Alert variant="destructive" className="mb-8">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error || localError}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Card className="border-none shadow-xl bg-gradient-to-br from-card to-secondary/30 overflow-hidden pt-0">
                        <CardHeader className="border-b bg-muted/40 pt-6 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary border-2 border-background shadow-inner">
                                    <UserPlus className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle>Partner Profile</CardTitle>
                                    <CardDescription>Contact information for communication and billing.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="resellerName">Full Name / Business Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="resellerName"
                                            name="resellerName"
                                            className="pl-10"
                                            placeholder="e.g. Maria Clara, Zen Shippers"
                                            value={formData.resellerName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="resellerEmail">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="resellerEmail"
                                                name="resellerEmail"
                                                type="email"
                                                className="pl-10"
                                                placeholder="partner@example.com"
                                                value={formData.resellerEmail || ''}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="resellerPhone">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="resellerPhone"
                                                name="resellerPhone"
                                                className="pl-10"
                                                placeholder="+63 912 345 6789"
                                                value={formData.resellerPhone || ''}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="p-8 pt-0 flex flex-col sm:flex-row gap-3">
                            <Button
                                type="submit"
                                className="w-full sm:flex-1 h-11 shadow-lg shadow-primary/20"
                                disabled={mutationLoading}
                            >
                                {mutationLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        {isEdit ? 'Update Profile' : 'Enroll Partner'}
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full sm:w-auto h-11"
                                onClick={() => navigate('/resellers')}
                                disabled={mutationLoading}
                            >
                                Cancel
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </main>
        </div>
    );
};
