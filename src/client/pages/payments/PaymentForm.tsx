import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    CreditCard,
    Calendar,
    Trash2,
    Loader2,
    AlertCircle,
    Hash,
    Image as ImageIcon
} from 'lucide-react';
import { usePayment, usePaymentMutations } from '@/hooks/usePayments';
import { useCustomers } from '@/hooks/useCustomers';
import { uploadApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Combobox } from '@/components/ui/combobox';
import type { CreatePaymentDto } from '@/lib/types';
import { HeaderContent } from '@/components/layout/HeaderProvider';
import { FormActions } from '@/components/ui/FormActions';

export const PaymentForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const { data: customers } = useCustomers();
    const { data: payment, loading: loadingPayment } = usePayment(Number(id));
    const { createAction, updateAction, loading: mutationLoading, error } = usePaymentMutations();

    const [formData, setFormData] = useState<CreatePaymentDto>({
        paymentAmount: 0,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'gcash',
        paymentReference: '',
        paymentProof: '',
        customerId: 0,
    });

    const activeCustomers = useMemo(() => customers?.filter(customer =>
        customer.customerStatus === 'active' || customer.id === formData.customerId
    ) || [], [customers, formData.customerId]);

    const [uploading, setUploading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        if (isEdit && payment) {
            setFormData({
                paymentAmount: payment.paymentAmount,
                paymentDate: new Date(payment.paymentDate).toISOString().split('T')[0],
                paymentMethod: payment.paymentMethod,
                paymentReference: payment.paymentReference || '',
                paymentProof: payment.paymentProof || '',
                customerId: payment.customerId,
            });
        }
    }, [isEdit, payment]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value,
        }));
    };

    // Helper to display number inputs - shows empty string instead of 0
    const displayNumber = (value: number | undefined) => {
        return value === 0 || value === undefined ? '' : value;
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: name === 'customerId' ? Number(value) : value,
        }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setLocalError(null);
        const result = await uploadApi.upload(file);
        setUploading(false);

        if (result.success && result.data) {
            setFormData(prev => ({ ...prev, paymentProof: result.data!.url }));
        } else {
            setLocalError(result.error || 'Failed to upload proof of payment');
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLocalError(null);

        if (!formData.customerId) {
            setLocalError('Please select a customer');
            return;
        }

        let result;
        if (isEdit) {
            result = await updateAction({ id: Number(id), data: formData });
        } else {
            result = await createAction(formData);
        }

        // useMutation execute returns T | null - null means error (error is set via hook's error state)
        if (result) {
            navigate('/payments');
        }
        // If result is null, the error was already set by the mutation hook
    };

    if (isEdit && loadingPayment) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading payment details...</p>
            </div>
        );
    }

    return (
        <div className="bg-background text-foreground font-sans min-h-screen pb-24">
            {/* Clear header content from previous page */}
            <HeaderContent title={isEdit ? 'Edit Payment' : 'New Payment'} />

            <main className="max-w-md md:max-w-4xl mx-auto px-4 pt-4 md:pt-6">
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-foreground tracking-tight mb-2 uppercase">
                        {isEdit ? 'Update Payment' : 'Record Payment'}
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium">
                        {isEdit ? 'Update existing payment entry.' : 'Log a payment received from a customer.'}
                    </p>
                </div>

                {(error || localError) && (
                    <Alert variant="destructive" className="mb-8">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error || localError}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                    Transaction Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="customerId">Customer</Label>
                                    <Combobox
                                        options={activeCustomers.map(customer => ({ label: customer.customerName, value: customer.id }))}
                                        value={formData.customerId}
                                        onChange={(value) => handleSelectChange('customerId', value.toString())}
                                        placeholder="Select a customer"
                                        searchPlaceholder="Search customers..."
                                        emptyMessage="No customer found."
                                    />
                                </div>

                                <Separator />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="paymentAmount">Amount Paid (PHP)</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-bold">₱</span>
                                            <Input
                                                id="paymentAmount"
                                                name="paymentAmount"
                                                type="number"
                                                step="0.01"
                                                className="pl-7"
                                                value={displayNumber(formData.paymentAmount)}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="paymentDate">Date Received</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="paymentDate"
                                                name="paymentDate"
                                                type="date"
                                                className="pl-10"
                                                value={formData.paymentDate}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="paymentMethod">Payment Method</Label>
                                        <Select
                                            value={formData.paymentMethod}
                                            onValueChange={(v) => handleSelectChange('paymentMethod', v)}
                                        >
                                            <SelectTrigger id="paymentMethod">
                                                <SelectValue placeholder="Select method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="gcash">Gcash</SelectItem>
                                                <SelectItem value="paymaya">Maya</SelectItem>
                                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                <SelectItem value="cash">Cash</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="paymentReference">Reference Number</Label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="paymentReference"
                                                name="paymentReference"
                                                className="pl-10"
                                                placeholder="Optional"
                                                value={formData.paymentReference || ''}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-8">
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4 text-primary" />
                                    Proof of Payment
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="aspect-[3/4] rounded-lg border-2 border-dashed border-muted bg-secondary/30 flex flex-col items-center justify-center relative group overflow-hidden">
                                    {formData.paymentProof ? (
                                        <>
                                            <img src={formData.paymentProof} className="w-full h-full object-cover" alt="Payment Proof" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <Button size="icon" variant="destructive" onClick={() => setFormData(prev => ({ ...prev, paymentProof: '' }))} type="button">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-4">
                                            <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                                            <p className="text-xs text-muted-foreground">Upload receipt screenshot</p>
                                        </div>
                                    )}
                                    <Input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                        onChange={handleFileUpload}
                                        accept="image/*"
                                        disabled={uploading}
                                    />
                                </div>
                                {uploading && (
                                    <div className="flex items-center gap-2 text-xs text-primary animate-pulse">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Uploading...
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="bg-muted/20 p-4">
                                <p className="text-[10px] text-center w-full text-muted-foreground">Screenshots preferred (max. 10MB)</p>
                            </CardFooter>
                        </Card>
                    </div>
                </form>
            </main>
            <FormActions
                onCancel={() => navigate(-1)}
                onSave={handleSubmit}
                isSaving={mutationLoading || uploading}
                saveLabel={isEdit ? 'Update' : 'Save'}
                disabled={mutationLoading || uploading}
            />
        </div>
    );
};
