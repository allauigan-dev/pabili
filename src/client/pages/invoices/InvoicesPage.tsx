import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoices, useInvoiceMutations } from '../../hooks/useInvoices';
import { InvoiceCard } from './InvoiceCard';
import { Button, Spinner, EmptyState } from '../../components';

export const InvoicesPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: invoices, loading, error, refetch } = useInvoices();
    const { deleteAction } = useInvoiceMutations();

    const handleDelete = async (id: number) => {
        await deleteAction(id);
        refetch();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Invoices</h1>
                <Button
                    variant="primary"
                    icon={<span className="text-xl">+</span>}
                    onClick={() => navigate('/invoices/new')}
                >
                    Create Invoice
                </Button>
            </div>

            {loading ? (
                <Spinner className="py-20" />
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex justify-between items-center">
                    <span>{error}</span>
                    <Button size="sm" variant="ghost" onClick={refetch}>Retry</Button>
                </div>
            ) : invoices && invoices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {invoices.map((invoice) => (
                        <InvoiceCard
                            key={invoice.id}
                            invoice={invoice}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    title="No invoices generated"
                    description="Invoices help you request payment from resellers. Create one after packing their orders."
                    actionLabel="Create Invoice"
                    onAction={() => navigate('/invoices/new')}
                    icon="📄"
                />
            )}
        </div>
    );
};
