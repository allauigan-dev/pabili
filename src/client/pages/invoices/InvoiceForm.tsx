import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select, Spinner } from '../../components';
import { invoicesApi } from '../../lib/api';
import { useMutation } from '../../hooks/useApi';
import { useResellers } from '../../hooks/useResellers';
import type { CreateInvoiceDto, Invoice } from '../../lib/types';

export const InvoiceForm: React.FC = () => {
    const navigate = useNavigate();
    const { data: resellers, loading: resellersLoading } = useResellers();
    const createMutation = useMutation<Invoice, CreateInvoiceDto>(invoicesApi.create);

    const [formData, setFormData] = useState<CreateInvoiceDto>({
        invoiceTotal: 0,
        invoicePaid: 0,
        invoiceNotes: '',
        dueDate: '',
        invoiceStatus: 'draft',
        resellerId: 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumber = ['invoiceTotal', 'invoicePaid', 'resellerId'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.resellerId === 0) {
            alert('Please select a reseller');
            return;
        }

        await createMutation.execute(formData);
        navigate('/invoices');
    };

    if (resellersLoading) return <Spinner className="py-20" />;

    const resellerOptions = resellers?.map(r => ({ value: r.id, label: r.resellerName })) || [];

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                    ← Back
                </Button>
                <h1 className="text-2xl font-bold">Create Invoice</h1>
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
                        label="Total Amount (PHP)"
                        type="number"
                        name="invoiceTotal"
                        value={formData.invoiceTotal}
                        onChange={handleChange}
                        required
                        step="0.01"
                    />

                    <Input
                        label="Amount Paid (PHP)"
                        type="number"
                        name="invoicePaid"
                        value={formData.invoicePaid || 0}
                        onChange={handleChange}
                        step="0.01"
                    />

                    <Input
                        label="Due Date"
                        type="date"
                        name="dueDate"
                        value={formData.dueDate || ''}
                        onChange={handleChange}
                    />

                    <Select
                        label="Initial Status"
                        name="invoiceStatus"
                        value={formData.invoiceStatus}
                        onChange={handleChange}
                        options={[
                            { value: 'draft', label: 'Draft' },
                            { value: 'sent', label: 'Sent' },
                            { value: 'paid', label: 'Paid' },
                        ]}
                    />

                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)] mb-1 block">Notes</label>
                        <textarea
                            name="invoiceNotes"
                            value={formData.invoiceNotes || ''}
                            onChange={handleChange}
                            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-2 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none h-24"
                            placeholder="Add bank details or payment instructions"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="ghost" type="button" onClick={() => navigate(-1)} disabled={createMutation.loading}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" isLoading={createMutation.loading}>
                        Generate Invoice
                    </Button>
                </div>
            </form>
        </div>
    );
};
