import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    CreditCard,
    Calendar,
    Trash2,
    Loader2,
    AlertCircle,
    Hash,
    Image as ImageIcon,
    Upload,
    Check,
    User,
    DollarSign,
    FileText
} from 'lucide-react';
import { usePayment, usePaymentMutations } from '@/hooks/usePayments';
import { useCustomers } from '@/hooks/useCustomers';
import { uploadApi } from '@/lib/api';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import type { CreatePaymentDto, PaymentStatus, PaymentMethod } from '@/lib/types';
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
        paymentStatus: 'confirmed',
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
                paymentStatus: payment.paymentStatus,
                customerId: payment.customerId,
            });
        }
    }, [isEdit, payment]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value,
        }));
    };

    const displayNumber = (value: number | undefined) => {
        return value === 0 || value === undefined ? '' : value;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setLocalError(null);
        const result = await uploadApi.upload(file);
        setUploading(false);

        if (result.success && result.data?.url) {
            setFormData(prev => ({ ...prev, paymentProof: result.data!.url }));
        } else {
            setLocalError(result.error || 'Failed to upload proof of payment');
        }
    };

    const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
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

        if (result) {
            navigate('/payments');
        }
    };

    if (isEdit && loadingPayment) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse font-medium">Loading details...</p>
            </div>
        );
    }

    return (
        <div className="bg-background text-foreground font-sans min-h-screen pb-24">
            <HeaderContent title={isEdit ? 'Edit Payment' : 'New Payment'} />

            <main className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-4 pt-4 md:pt-6">
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-foreground tracking-tight mb-2 uppercase">
                        {isEdit ? 'Update Payment' : 'Record Payment'}
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium">
                        {isEdit ? 'Update existing payment entry.' : 'Log a payment received from a customer.'}
                    </p>
                </div>

                {(error || localError) && (
                    <div className="mb-8">
                        <Alert variant="destructive" className="rounded-2xl border-destructive/20 bg-destructive/5">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle className="font-bold">Action failed</AlertTitle>
                            <AlertDescription className="font-medium">
                                {error || localError}
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Status & Proof */}
                        <div className="lg:col-span-12 space-y-8">
                            <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50">
                                <div className="flex items-center mb-6">
                                    <div className="p-2 rounded-xl bg-primary/10 mr-3">
                                        <ImageIcon className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground tracking-tight">Proof of Payment</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                                    {/* Proof Upload */}
                                    <div className="space-y-4">
                                        {formData.paymentProof ? (
                                            <div className="relative aspect-video max-w-lg mx-auto group rounded-2xl overflow-hidden border border-border/50 animate-in fade-in zoom-in duration-300">
                                                <img src={formData.paymentProof} alt="Proof" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, paymentProof: '' }))} className="p-2 bg-destructive text-destructive-foreground rounded-full hover:scale-110 transition-transform shadow-lg">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-border/60 rounded-2xl hover:border-primary/50 transition-colors cursor-pointer group bg-secondary/20 relative overflow-hidden min-h-[240px]">
                                                <div className="space-y-2 text-center my-auto">
                                                    <Upload className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors mx-auto" />
                                                    <div className="flex text-sm text-muted-foreground justify-center">
                                                        <label htmlFor="proof-upload" className="relative cursor-pointer rounded-md font-bold text-primary hover:text-primary-dark transition-colors">
                                                            <span>Upload receipt or screenshot</span>
                                                        </label>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">
                                                        PNG, JPG up to 10MB
                                                    </p>
                                                </div>
                                                <input id="proof-upload" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileUpload} accept="image/*" disabled={uploading} />
                                            </div>
                                        )}
                                        {uploading && <p className="text-center text-xs text-primary font-bold animate-pulse">Uploading proof...</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Transaction Details */}
                        <div className="lg:col-span-7 space-y-8">
                            <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50">
                                <div className="flex items-center mb-6">
                                    <div className="p-2 rounded-xl bg-primary/10 mr-3">
                                        <CreditCard className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground tracking-tight">Transaction Info</h3>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="customerId" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Customer</label>
                                        <Combobox
                                            options={activeCustomers.map(customer => ({ label: customer.customerName, value: customer.id }))}
                                            value={formData.customerId}
                                            onChange={(value) => setFormData(prev => ({ ...prev, customerId: Number(value) }))}
                                            placeholder="Select Customer"
                                            searchPlaceholder="Search customers..."
                                            emptyMessage="No customer found."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="paymentAmount" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Amount Paid</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground font-black text-sm">₱</span>
                                                <input
                                                    type="number"
                                                    id="paymentAmount"
                                                    name="paymentAmount"
                                                    value={displayNumber(formData.paymentAmount)}
                                                    onChange={handleChange}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    className="w-full rounded-2xl border-border/60 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary pl-10 py-4 px-4 border outline-none transition-all font-black text-lg"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="paymentDate" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Date Received</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
                                                <input
                                                    type="date"
                                                    id="paymentDate"
                                                    name="paymentDate"
                                                    value={formData.paymentDate}
                                                    onChange={handleChange}
                                                    className="w-full rounded-2xl border-border/60 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary pl-12 py-4 px-4 border outline-none transition-all font-medium"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="paymentMethod" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Method</label>
                                            <Select
                                                value={formData.paymentMethod}
                                                onValueChange={(v) => setFormData(prev => ({ ...prev, paymentMethod: v as PaymentMethod }))}
                                            >
                                                <SelectTrigger id="paymentMethod" className="w-full rounded-2xl border-2 border-border/60 bg-secondary/30 text-foreground h-14 px-5 focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold outline-none transition-all">
                                                    <SelectValue placeholder="Select method" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-border/50 shadow-xl overflow-hidden">
                                                    <SelectItem value="cash" className="font-bold py-3 pr-8">Cash</SelectItem>
                                                    <SelectItem value="gcash" className="font-bold py-3 pr-8">GCash</SelectItem>
                                                    <SelectItem value="paymaya" className="font-bold py-3 pr-8">Maya</SelectItem>
                                                    <SelectItem value="bank_transfer" className="font-bold py-3 pr-8">Bank Transfer</SelectItem>
                                                    <SelectItem value="other" className="font-bold py-3 pr-8">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <label htmlFor="paymentReference" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Reference No.</label>
                                            <div className="relative">
                                                <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
                                                <input
                                                    type="text"
                                                    id="paymentReference"
                                                    name="paymentReference"
                                                    value={formData.paymentReference || ''}
                                                    onChange={handleChange}
                                                    placeholder="Optional"
                                                    className="w-full rounded-2xl border-border/60 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/40 py-4 pl-12 pr-4 border outline-none transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status & Notes */}
                        <div className="lg:col-span-12 md:lg:col-span-5 space-y-8">
                            <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50">
                                <div className="flex items-center mb-6">
                                    <div className="p-2 rounded-xl bg-primary/10 mr-3">
                                        <AlertCircle className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground tracking-tight">Status & Notes</h3>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="paymentStatus" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">Confirmation Status</label>
                                        <Select
                                            value={formData.paymentStatus}
                                            onValueChange={(v) => setFormData(prev => ({ ...prev, paymentStatus: v as PaymentStatus }))}
                                        >
                                            <SelectTrigger id="paymentStatus" className="w-full rounded-2xl border-2 border-border/60 bg-secondary/30 text-foreground h-14 px-5 focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold outline-none transition-all">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-border/50 shadow-xl overflow-hidden">
                                                <SelectItem value="pending" className="font-bold py-3 pr-8">Pending</SelectItem>
                                                <SelectItem value="confirmed" className="font-bold py-3 pr-8 text-emerald-600">Confirmed</SelectItem>
                                                <SelectItem value="rejected" className="font-bold py-3 pr-8 text-red-600">Rejected</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label htmlFor="paymentNotes" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Notes</label>
                                        <div className="relative">
                                            <FileText className="absolute left-4 top-4 h-5 w-5 text-muted-foreground/40" />
                                            <textarea
                                                id="paymentNotes"
                                                name="paymentNotes"
                                                value={formData.paymentNotes || ''}
                                                onChange={handleChange}
                                                placeholder="Add internal notes about this payment..."
                                                rows={3}
                                                className="w-full rounded-2xl border-border/60 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/40 py-4 pl-12 pr-4 border outline-none transition-all resize-none font-medium text-sm"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </main>

            <FormActions
                onCancel={() => navigate(-1)}
                onSave={handleSubmit}
                isSaving={mutationLoading || uploading}
                saveLabel={isEdit ? 'Update' : 'Save'}
                saveIcon={Check}
                disabled={mutationLoading || uploading}
            />
        </div>
    );
};
