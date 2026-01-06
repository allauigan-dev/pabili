import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    User,
    Mail,
    Phone,
    Loader2,
    AlertCircle,
    UserPlus
} from 'lucide-react';
import { useCustomer, useCustomerMutations } from '@/hooks/useCustomers';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { CreateCustomerDto } from '@/lib/types';
import { HeaderContent } from '@/components/layout/HeaderProvider';
import { FormActions } from '@/components/ui/FormActions';

export const CustomerForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const { data: customer, loading: loadingCustomer } = useCustomer(Number(id));
    const { createAction, updateAction, loading: mutationLoading, error } = useCustomerMutations();

    const [formData, setFormData] = useState<CreateCustomerDto>({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
    });

    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        if (isEdit && customer) {
            setFormData({
                customerName: customer.customerName,
                customerEmail: customer.customerEmail,
                customerPhone: customer.customerPhone,
            });
        }
    }, [isEdit, customer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLocalError(null);

        let result;
        if (isEdit) {
            result = await updateAction({ id: Number(id), data: formData });
        } else {
            result = await createAction(formData);
        }

        if (result) {
            navigate('/customers');
        } else {
            // Error is handled by the hook and will be returned via the 'error' prop
        }
    };

    if (isEdit && loadingCustomer) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading customer data...</p>
            </div>
        );
    }

    return (
        <div className="bg-background text-foreground font-sans min-h-screen pb-24">
            {/* Clear header content from previous page */}
            <HeaderContent title={isEdit ? 'Edit Customer' : 'New Customer'} />

            <main className="max-w-md md:max-w-2xl mx-auto px-4 pt-4 md:pt-6">
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-foreground tracking-tight mb-2 uppercase">
                        {isEdit ? 'Update Profile' : 'Enroll Customer'}
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium">
                        {isEdit ? 'Update profile information for this customer.' : 'Onboard a new customer to your pasabuy network.'}
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
                                    <CardTitle>Customer Profile</CardTitle>
                                    <CardDescription>Contact information for communication and billing.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="customerName">Full Name / Business Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="customerName"
                                            name="customerName"
                                            className="pl-10"
                                            placeholder="e.g. Maria Clara, Zen Shippers"
                                            value={formData.customerName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="customerEmail">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="customerEmail"
                                                name="customerEmail"
                                                type="email"
                                                className="pl-10"
                                                placeholder="customer@example.com"
                                                value={formData.customerEmail || ''}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="customerPhone">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="customerPhone"
                                                name="customerPhone"
                                                className="pl-10"
                                                placeholder="+63 912 345 6789"
                                                value={formData.customerPhone || ''}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </main>
            <FormActions
                onCancel={() => navigate('/customers')}
                onSave={handleSubmit}
                isSaving={mutationLoading}
                saveLabel={isEdit ? 'Update' : 'Save'}
                disabled={mutationLoading}
            />
        </div>
    );
};
