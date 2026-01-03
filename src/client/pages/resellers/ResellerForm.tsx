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

        if (result.success) {
            navigate('/resellers');
        } else {
            setLocalError(result.error || 'Failed to save reseller');
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
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/resellers')} className="gap-2 -ml-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Resellers
                </Button>
            </div>

            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">
                    {isEdit ? 'Edit Reseller' : 'Enroll New Reseller'}
                </h1>
                <p className="text-muted-foreground">
                    {isEdit ? 'Update profile information for this business partner.' : 'Onboard a new reseller to your pasabuy network.'}
                </p>
            </div>

            {(error || localError) && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error || localError}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <Card className="border-none shadow-xl bg-gradient-to-br from-card to-secondary/30">
                    <CardHeader className="border-b bg-muted/40 pb-6">
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
                                            value={formData.resellerEmail}
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
                                            value={formData.resellerPhone}
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
        </div>
    );
};
