import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    User,
    ShoppingCart,
    Loader2,
    AlertCircle,
    FileCheck,
    Check,
    Package,
    Receipt,
    FileText
} from 'lucide-react';
import { useInvoice, useInvoiceMutations } from '@/hooks/useInvoices';
import { useCustomers } from '@/hooks/useCustomers';
import { useOrders } from '@/hooks/useOrders';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { cn, formatCurrency } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { CreateInvoiceDto, InvoiceStatus } from '@/lib/types';
import { HeaderContent } from '@/components/layout/HeaderProvider';
import { FormActions } from '@/components/ui/FormActions';

export const InvoiceForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const { data: customers } = useCustomers();
    const { data: orders } = useOrders();
    const { data: invoice, loading: loadingInvoice } = useInvoice(Number(id));
    const { createAction, updateAction, loading: mutationLoading, error } = useInvoiceMutations();

    const [formData, setFormData] = useState<CreateInvoiceDto>({
        invoiceStatus: 'draft',
        invoiceTotal: 0,
        customerId: 0,
        orderIds: [],
        invoiceNotes: '',
    });

    const activeCustomers = useMemo(() => customers?.filter(customer =>
        customer.customerStatus === 'active' || customer.id === formData.customerId
    ) || [], [customers, formData.customerId]);

    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        if (isEdit && invoice) {
            setFormData({
                invoiceStatus: invoice.invoiceStatus as InvoiceStatus,
                invoiceTotal: invoice.invoiceTotal,
                customerId: invoice.customerId,
                orderIds: invoice.orderIds || [],
                invoiceNotes: invoice.invoiceNotes || '',
            });
        }
    }, [isEdit, invoice]);

    // Filter orders by selected customer and delivered status
    const availableOrders = useMemo(() => {
        if (!formData.customerId) return [];
        return orders?.filter(o =>
            o.customerId === formData.customerId &&
            (o.orderStatus === 'delivered' || (formData.orderIds || []).includes(o.id))
        ) || [];
    }, [orders, formData.customerId, formData.orderIds]);

    useEffect(() => {
        const total = availableOrders
            .filter(o => (formData.orderIds || []).includes(o.id))
            .reduce((sum, o) => sum + (o.orderCustomerTotal || 0), 0);
        setFormData(prev => ({ ...prev, invoiceTotal: total }));
    }, [formData.orderIds, availableOrders]);

    const toggleOrder = (orderId: number) => {
        setFormData(prev => {
            const currentOrderIds = prev.orderIds || [];
            const isSelected = currentOrderIds.includes(orderId);
            const newOrderIds = isSelected
                ? currentOrderIds.filter(id => id !== orderId)
                : [...currentOrderIds, orderId];
            return { ...prev, orderIds: newOrderIds };
        });
    };

    const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
        if (e) e.preventDefault();
        setLocalError(null);

        if (!formData.customerId) {
            setLocalError('Please select a customer');
            return;
        }

        if ((formData.orderIds || []).length === 0) {
            setLocalError('Please select at least one order to include in the invoice');
            return;
        }

        let result;
        if (isEdit) {
            result = await updateAction({ id: Number(id), data: formData });
        } else {
            result = await createAction(formData);
        }

        if (result) {
            navigate('/invoices');
        }
    };

    if (isEdit && loadingInvoice) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse font-medium">Loading details...</p>
            </div>
        );
    }

    const currentOrderIds = formData.orderIds || [];

    return (
        <div className="bg-background text-foreground font-sans min-h-screen pb-24">
            <HeaderContent title={isEdit ? 'Edit Invoice' : 'New Invoice'} />

            <main className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-4 pt-4 md:pt-6">
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-foreground tracking-tight mb-2 uppercase">
                        {isEdit ? 'Update Invoice' : 'Create Invoice'}
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium">
                        {isEdit ? 'Modify billing for this invoice.' : 'Batch orders and create a formal billing statement.'}
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
                        {/* Billing Details */}
                        <div className="lg:col-span-7 space-y-8">
                            <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50">
                                <div className="flex items-center mb-6">
                                    <div className="p-2 rounded-xl bg-primary/10 mr-3">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground tracking-tight">Billing Context</h3>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="customerId" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Customer / Bill To</label>
                                        <Combobox
                                            options={activeCustomers.map(customer => ({ label: customer.customerName, value: customer.id }))}
                                            value={formData.customerId}
                                            onChange={(value) => setFormData(prev => ({ ...prev, customerId: Number(value), orderIds: [] }))}
                                            disabled={isEdit}
                                            placeholder="Select Customer"
                                            searchPlaceholder="Search customers..."
                                            emptyMessage="No customer found."
                                        />
                                        {isEdit && <p className="text-[10px] text-muted-foreground mt-2 px-1">Customer cannot be changed after invoice creation.</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="invoiceStatus" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Payment Status</label>
                                        <Select
                                            value={formData.invoiceStatus}
                                            onValueChange={(v) => setFormData(prev => ({ ...prev, invoiceStatus: v as InvoiceStatus }))}
                                        >
                                            <SelectTrigger id="invoiceStatus" className="w-full rounded-2xl border-2 border-border/60 bg-secondary/30 text-foreground h-14 px-5 focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold outline-none transition-all">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-border/50 shadow-xl overflow-hidden">
                                                <SelectItem value="draft" className="font-bold py-3 pr-8 text-amber-600">Pending Payment (Draft)</SelectItem>
                                                <SelectItem value="sent" className="font-bold py-3 pr-8 text-blue-600">Sent to Customer</SelectItem>
                                                <SelectItem value="paid" className="font-bold py-3 pr-8 text-emerald-600">Paid in Full</SelectItem>
                                                <SelectItem value="partial" className="font-bold py-3 pr-8 text-orange-600">Partially Paid</SelectItem>
                                                <SelectItem value="overdue" className="font-bold py-3 pr-8 text-red-600">Overdue</SelectItem>
                                                <SelectItem value="cancelled" className="font-bold py-3 pr-8 text-muted-foreground">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center">
                                        <div className="p-2 rounded-xl bg-primary/10 mr-3">
                                            <ShoppingCart className="h-5 w-5 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground tracking-tight">Included Orders</h3>
                                    </div>
                                    <span className="bg-secondary text-secondary-foreground text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                        {currentOrderIds.length} Selected
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {!formData.customerId ? (
                                        <div className="py-12 text-center bg-secondary/20 rounded-2xl border-2 border-dashed border-border/60">
                                            <Package className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-20" />
                                            <p className="text-sm font-medium text-muted-foreground">Select a customer first to see their orders.</p>
                                        </div>
                                    ) : availableOrders.length === 0 ? (
                                        <div className="py-12 text-center bg-secondary/20 rounded-2xl border-2 border-dashed border-border/60">
                                            <Package className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-20" />
                                            <p className="text-sm font-medium text-muted-foreground">No deliverable orders found for this customer.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {availableOrders.map(order => {
                                                const isSelected = currentOrderIds.includes(order.id);
                                                return (
                                                    <div
                                                        key={order.id}
                                                        onClick={() => toggleOrder(order.id)}
                                                        className={cn(
                                                            "group flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all",
                                                            isSelected
                                                                ? "bg-primary/5 border-primary shadow-sm"
                                                                : "bg-secondary/10 border-border/60 hover:border-primary/30"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={cn(
                                                                "h-12 w-12 rounded-xl bg-secondary flex items-center justify-center shrink-0 border border-border/50 transition-colors overflow-hidden",
                                                                isSelected ? "bg-primary/20 border-primary/30" : ""
                                                            )}>
                                                                {order.orderImage ? (
                                                                    <img src={order.orderImage} className="h-full w-full object-cover" alt="" />
                                                                ) : (
                                                                    <Package className="h-6 w-6 text-muted-foreground/40" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold group-hover:text-primary transition-colors">{order.orderName}</p>
                                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">#{order.orderNumber || order.id} • {new Date(order.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <p className="text-sm font-black">{formatCurrency(order.orderCustomerTotal || 0)}</p>
                                                            <div className={cn(
                                                                "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                                isSelected ? "bg-primary border-primary scale-110 shadow-md" : "border-border/60"
                                                            )}>
                                                                {isSelected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={4} />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Summary & Notes */}
                        <div className="lg:col-span-5 space-y-8">
                            <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50 text-foreground overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                    <Receipt className="h-32 w-32" />
                                </div>
                                <div className="flex items-center mb-6">
                                    <div className="p-2 rounded-xl bg-primary/10 mr-3">
                                        <Receipt className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground tracking-tight">Summary</h3>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-muted-foreground">Subtotal ({currentOrderIds.length} orders)</span>
                                        <span className="font-bold">{formatCurrency(formData.invoiceTotal || 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-muted-foreground">Service Fees</span>
                                        <span className="font-bold">{formatCurrency(0)}</span>
                                    </div>
                                    <div className="pt-4 border-t border-border/50">
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Amount</span>
                                            <span className="text-3xl font-black text-primary leading-none">{formatCurrency(formData.invoiceTotal || 0)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50">
                                <div className="flex items-center mb-6">
                                    <div className="p-2 rounded-xl bg-primary/10 mr-3">
                                        <FileText className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground tracking-tight">Invoice Notes</h3>
                                </div>

                                <div className="space-y-4">
                                    <textarea
                                        id="invoiceNotes"
                                        name="invoiceNotes"
                                        value={formData.invoiceNotes || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, invoiceNotes: e.target.value }))}
                                        placeholder="Add instructions or bank details for the customer..."
                                        rows={4}
                                        className="w-full rounded-2xl border-border/60 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/40 py-4 px-4 border outline-none transition-all resize-none font-medium text-sm"
                                    ></textarea>
                                </div>
                            </div>

                            <Alert className="rounded-2xl border-blue-500/20 bg-blue-500/5">
                                <AlertCircle className="h-4 w-4 text-blue-500" />
                                <AlertTitle className="text-blue-500 font-bold">Billing Notice</AlertTitle>
                                <AlertDescription className="text-blue-500/80 font-medium text-xs">
                                    Generating an invoice will consolidate the totals of all selected orders into a single billing statement.
                                </AlertDescription>
                            </Alert>
                        </div>
                    </div>
                </form>
            </main>

            <FormActions
                onCancel={() => navigate(-1)}
                onSave={handleSubmit}
                isSaving={mutationLoading}
                saveLabel={isEdit ? 'Update' : 'Generate'}
                saveIcon={FileCheck}
                disabled={mutationLoading || currentOrderIds.length === 0}
            />
        </div>
    );
};
