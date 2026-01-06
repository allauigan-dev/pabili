import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    User,
    Calendar,
    Edit,
    ArrowLeft,
    Package,
    ShoppingCart
} from 'lucide-react';
import { useInvoice } from '@/hooks/useInvoices';
import { useOrders } from '@/hooks/useOrders';
import { HeaderContent } from '@/components/layout/HeaderProvider';
import { FormActions } from '@/components/ui/FormActions';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export const InvoiceDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: invoice, loading } = useInvoice(Number(id));
    const { data: orders } = useOrders();

    if (loading || !invoice) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground animate-pulse font-medium">Loading invoice details...</p>
            </div>
        );
    }

    const includedOrders = orders?.filter(o => (invoice.orderIds || []).includes(o.id)) || [];

    const statusConfig = {
        draft: { color: 'bg-slate-500', label: 'Draft' },
        pending: { color: 'bg-amber-500', label: 'Pending Payment' },
        sent: { color: 'bg-blue-500', label: 'Sent' },
        paid: { color: 'bg-emerald-500', label: 'Paid' },
        partial: { color: 'bg-indigo-500', label: 'Partially Paid' },
        overdue: { color: 'bg-rose-500', label: 'Overdue' },
        cancelled: { color: 'bg-gray-500', label: 'Cancelled' },
    };

    const status = statusConfig[invoice.invoiceStatus as keyof typeof statusConfig] || statusConfig.draft;

    return (
        <div className="bg-background text-foreground font-sans min-h-screen pb-24">
            <HeaderContent
                title="Invoice Details"
                actions={
                    <button
                        onClick={() => navigate('/invoices')}
                        className="p-2 hover:bg-secondary rounded-full transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                }
            />

            <main className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-4 pt-4 md:pt-6">
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-widest ${status.color}`}>
                                {status.label}
                            </div>
                            <span className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(invoice.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-foreground tracking-tight mb-1">
                            {invoice.invoiceNumber}
                        </h2>
                        <div className="flex items-center gap-2 text-muted-foreground font-medium">
                            <User className="h-4 w-4" />
                            <span>Billed to: <span className="text-foreground font-bold">{invoice.customerName}</span></span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Amount</p>
                        <p className="text-4xl font-black text-primary">{formatCurrency(invoice.invoiceTotal)}</p>
                    </div>
                </div>

                <div className="bg-card rounded-3xl overflow-hidden shadow-soft border border-border/50">
                    <div className="p-6 md:p-8 border-b border-border/50 bg-secondary/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10">
                                <ShoppingCart className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold tracking-tight">Included Orders</h3>
                        </div>
                    </div>

                    <div className="p-0">
                        {includedOrders.length > 0 ? (
                            <div className="divide-y divide-border/50">
                                {includedOrders.map(order => (
                                    <div key={order.id} className="p-4 md:p-6 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center shrink-0 border border-border/50 overflow-hidden">
                                                {order.orderImage ? (
                                                    <img src={order.orderImage} className="h-full w-full object-cover" alt="" />
                                                ) : (
                                                    <Package className="h-6 w-6 text-muted-foreground opacity-50" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground text-lg">{order.orderName}</p>
                                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">#{order.id}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">{formatCurrency(order.orderCustomerTotal || 0)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-muted-foreground">
                                <p>No order details available</p>
                            </div>
                        )}

                        <div className="p-6 md:p-8 bg-secondary/5 space-y-3">
                            <div className="flex justify-between text-sm font-medium text-muted-foreground">
                                <span>Subtotal</span>
                                <span>{formatCurrency(invoice.invoiceTotal)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-end pt-2">
                                <span className="font-bold text-lg">Total</span>
                                <span className="font-black text-2xl">{formatCurrency(invoice.invoiceTotal)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <FormActions
                onCancel={() => navigate(-1)}
                onSave={() => navigate(`/invoices/${id}/edit`)}
                saveLabel="Update"
                saveIcon={Edit}
                cancelLabel="Back"
            />
        </div>
    );
};
