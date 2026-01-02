import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Badge, type BadgeProps } from '../../components/Badge';
import type { Invoice } from '../../lib/types';

interface InvoiceCardProps {
    invoice: Invoice;
    onDelete?: (id: number) => void;
}

const statusVariants: Record<Invoice['invoiceStatus'], BadgeProps['variant']> = {
    draft: 'neutral',
    sent: 'primary',
    paid: 'success',
    partial: 'warning',
    overdue: 'error',
    cancelled: 'error',
};

export const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, onDelete }) => {
    const navigate = useNavigate();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete && window.confirm('Are you sure you want to delete this invoice?')) {
            onDelete(invoice.id);
        }
    };

    return (
        <Card
            className="hover:shadow-md transition-shadow group relative"
            onClick={() => navigate(`/invoices/${invoice.id}`)}
        >
            {onDelete && (
                <button
                    onClick={handleDelete}
                    className="absolute top-2 right-2 p-1.5 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 rounded-full z-10"
                    title="Delete Invoice"
                >
                    🗑️
                </button>
            )}
            <div className="flex justify-between items-start mb-2 pr-6">
                <div>
                    <span className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider">#{invoice.invoiceNumber}</span>
                    <h4 className="font-bold text-[var(--text-primary)]">
                        {formatCurrency(invoice.invoiceTotal)}
                    </h4>
                </div>
                <Badge variant={statusVariants[invoice.invoiceStatus]}>
                    {invoice.invoiceStatus}
                </Badge>
            </div>

            <div className="mt-4 space-y-1">
                <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Paid:</span>
                    <span className="font-medium text-[var(--success)]">{formatCurrency(invoice.invoicePaid)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Balance:</span>
                    <span className="font-bold text-[var(--error)]">{formatCurrency(invoice.invoiceTotal - invoice.invoicePaid)}</span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--border)] flex justify-between items-center text-xs text-[var(--text-muted)]">
                <span>Created: {new Date(invoice.createdAt).toLocaleDateString()}</span>
                {invoice.dueDate && (
                    <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                )}
            </div>
        </Card>
    );
};
