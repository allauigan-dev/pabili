import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select, Spinner } from '../../components';
import { paymentsApi, uploadApi } from '../../lib/api';
import { useMutation } from '../../hooks/useApi';
import { useResellers } from '../../hooks/useResellers';
import type { CreatePaymentDto, Payment } from '../../lib/types';

export const PaymentForm: React.FC = () => {
    const navigate = useNavigate();
    const { data: resellers, loading: resellersLoading } = useResellers();
    const createMutation = useMutation<Payment, CreatePaymentDto>(paymentsApi.create);

    const [formData, setFormData] = useState<CreatePaymentDto>({
        paymentAmount: 0,
        paymentMethod: 'gcash',
        paymentReference: '',
        paymentNotes: '',
        resellerId: 0,
        paymentProof: '',
    });

    const [proofFile, setProofFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumber = ['paymentAmount', 'resellerId'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) : value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProofFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.resellerId === 0) {
            alert('Please select a reseller');
            return;
        }

        let proofUrl = formData.paymentProof;

        if (proofFile) {
            setIsUploading(true);
            const uploadRes = await uploadApi.upload(proofFile);
            if (uploadRes.success && uploadRes.data) {
                proofUrl = uploadRes.data.url;
            } else {
                alert('Proof upload failed: ' + uploadRes.error);
                setIsUploading(false);
                return;
            }
            setIsUploading(false);
        }

        await createMutation.execute({ ...formData, paymentProof: proofUrl });
        navigate('/payments');
    };

    if (resellersLoading) return <Spinner className="py-20" />;

    const resellerOptions = resellers?.map(r => ({ value: r.id, label: r.resellerName })) || [];

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                    ← Back
                </Button>
                <h1 className="text-2xl font-bold">Record Payment</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <Select
                            label="Reseller"
                            name="resellerId"
                            value={formData.resellerId}
                            onChange={handleChange}
                            options={resellerOptions}
                            required
                        />
                    </div>

                    <Input
                        label="Payment Amount (PHP)"
                        type="number"
                        name="paymentAmount"
                        value={formData.paymentAmount}
                        onChange={handleChange}
                        required
                        step="0.01"
                    />

                    <Select
                        label="Payment Method"
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                        options={[
                            { value: 'gcash', label: 'GCash' },
                            { value: 'paymaya', label: 'Maya' },
                            { value: 'bank_transfer', label: 'Bank Transfer' },
                            { value: 'cash', label: 'Cash' },
                            { value: 'other', label: 'Other' },
                        ]}
                        required
                    />

                    <Input
                        label="Reference Number"
                        name="paymentReference"
                        value={formData.paymentReference || ''}
                        onChange={handleChange}
                        placeholder="e.g. GCash Ref ID"
                    />

                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)] mb-1 block">Notes</label>
                        <textarea
                            name="paymentNotes"
                            value={formData.paymentNotes || ''}
                            onChange={handleChange}
                            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-2 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none h-24"
                            placeholder="Optional payment notes"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">Proof of Payment</label>
                        <div className="flex items-center gap-6">
                            <div className="w-32 h-32 bg-[var(--surface-hover)] rounded-lg border-2 border-dashed border-[var(--border)] flex items-center justify-center overflow-hidden">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl">🧾</span>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="text-sm text-[var(--text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary-light)] file:text-[var(--primary)] hover:file:bg-[var(--primary-hover)] file:transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="ghost" type="button" onClick={() => navigate(-1)} disabled={isUploading || createMutation.loading}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" isLoading={isUploading || createMutation.loading}>
                        Record Payment
                    </Button>
                </div>
            </form>
        </div>
    );
};
