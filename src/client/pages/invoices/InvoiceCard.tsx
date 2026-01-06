import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Edit,
    Trash2,
    Calendar,
    User,
    Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { Invoice } from '@/lib/types';

interface InvoiceCardProps {
    invoice: Invoice;
    onDelete?: (id: number) => void;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, onDelete }) => {
    const navigate = useNavigate();

    const statusConfig = {
        draft: {
            color: 'bg-slate-400',
            badge: 'bg-slate-100 text-slate-800',
            label: 'DRAFT'
        },
        pending: {
            color: 'bg-amber-400',
            badge: 'bg-amber-100 text-amber-800',
            label: 'PENDING'
        },
        sent: {
            color: 'bg-blue-400',
            badge: 'bg-blue-100 text-blue-800',
            label: 'SENT'
        },
        paid: {
            color: 'bg-emerald-500',
            badge: 'bg-emerald-100 text-emerald-800',
            label: 'PAID'
        },
        partial: {
            color: 'bg-indigo-400',
            badge: 'bg-indigo-100 text-indigo-800',
            label: 'PARTIAL'
        },
        overdue: {
            color: 'bg-rose-500',
            badge: 'bg-rose-100 text-rose-800',
            label: 'OVERDUE'
        },
        cancelled: {
            color: 'bg-gray-500',
            badge: 'bg-gray-100 text-gray-800',
            label: 'CANCELLED'
        },
    };

    const status = statusConfig[invoice.invoiceStatus as keyof typeof statusConfig] || statusConfig.draft;

    return (
        <div
            className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 shadow-soft border border-border/50 relative group overflow-hidden mb-4 cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => navigate(`/invoices/${invoice.id}`)}
        >
            {/* Status Strip */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${status.color} rounded-l-2xl`}></div>

            <div className="flex gap-4">
                {/* Icon/Image Section */}
                <div className="flex-shrink-0 w-20 h-20 bg-secondary/30 rounded-xl overflow-hidden border border-border/50 relative flex items-center justify-center">
                    <span className={`absolute top-0 right-0 text-[9px] font-bold px-1.5 py-0.5 rounded-bl-md z-10 ${status.badge}`}>
                        {status.label}
                    </span>
                    <Receipt className="h-8 w-8 text-muted-foreground opacity-50" />
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div className="flex justify-between items-start">
                        <div className="min-w-0 pr-2">
                            <h3 className="text-base font-bold text-foreground truncate">{invoice.invoiceNumber}</h3>
                            <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-3">
                                <span className="flex items-center truncate">
                                    <User className="h-3.5 w-3.5 mr-1 opacity-70" />
                                    {invoice.customerName}
                                </span>
                                <span className="flex items-center">
                                    <Calendar className="h-3.5 w-3.5 mr-1 opacity-70" />
                                    {new Date(invoice.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <p className="text-primary font-bold text-base whitespace-nowrap">
                            {formatCurrency(invoice.invoiceTotal)}
                        </p>
                    </div>

                    <div className="flex justify-end items-center mt-3 gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                            onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                            onClick={() => onDelete?.(invoice.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
