import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    ShoppingCart,
    Loader2,
    AlertCircle,
    FileCheck,
    Check,
    Package
} from 'lucide-react';
import { useInvoice, useInvoiceMutations } from '@/hooks/useInvoices';
import { useResellers } from '@/hooks/useResellers';
import { useOrders } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
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
    CardDescription,
    CardFooter
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Combobox } from '@/components/ui/combobox';
import { cn, formatCurrency } from '@/lib/utils';
import type { CreateInvoiceDto, InvoiceStatus } from '@/lib/types';

export const InvoiceForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const { data: resellers } = useResellers();
    const { data: orders } = useOrders();
    const { data: invoice, loading: loadingInvoice } = useInvoice(Number(id));
    const { createAction, updateAction, loading: mutationLoading, error } = useInvoiceMutations();

    const [formData, setFormData] = useState<CreateInvoiceDto>({
        invoiceStatus: 'draft',
        invoiceTotal: 0,
        resellerId: 0,
        orderIds: [],
    });

    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        if (isEdit && invoice) {
            setFormData({
                invoiceStatus: invoice.invoiceStatus as InvoiceStatus,
                invoiceTotal: invoice.invoiceTotal,
                resellerId: invoice.resellerId,
                orderIds: invoice.orderIds || [],
            });
        }
    }, [isEdit, invoice]);

    // Filter orders by selected reseller
    const availableOrders = useMemo(() => {
        if (!formData.resellerId) return [];
        return orders?.filter(o => o.resellerId === formData.resellerId) || [];
    }, [orders, formData.resellerId]);

    useEffect(() => {
        const total = availableOrders
            .filter(o => (formData.orderIds || []).includes(o.id))
            .reduce((sum, o) => sum + o.orderResellerTotal, 0);
        setFormData(prev => ({ ...prev, invoiceTotal: total }));
    }, [formData.orderIds, availableOrders]);

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => {
            if (name === 'resellerId') {
                return { ...prev, [name]: Number(value), orderIds: [] };
            }
            return { ...prev, [name]: value as any };
        });
    };

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (!formData.resellerId) {
            setLocalError('Please select a reseller');
            return;
        }

        if ((formData.orderIds || []).length === 0) {
            setLocalError('Please select at least one order to include in the invoice');
            return;
        }

        let result: any;
        if (isEdit) {
            result = await updateAction({ id: Number(id), data: formData });
        } else {
            result = await createAction(formData);
        }

        if (result && result.success) {
            navigate('/invoices');
        } else {
            setLocalError(result?.error || 'Failed to save invoice');
        }
    };

    if (isEdit && loadingInvoice) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading invoice details...</p>
            </div>
        );
    }

    const currentOrderIds = formData.orderIds || [];

    return (
        <div className="bg-background text-foreground font-sans min-h-screen pb-24">
            {/* Header */}
            <header className="sticky top-0 w-full z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 transition-all">
                <div className="max-w-5xl mx-auto h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/invoices')}
                            className="text-muted-foreground hover:text-primary transition-all flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary/80 active:scale-95 group"
                            type="button"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            <span className="text-sm font-bold">Back to Invoices</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-md md:max-w-4xl mx-auto px-4 pt-8 md:pt-12">
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-foreground tracking-tight mb-2 uppercase">
                        {isEdit ? 'Update Invoice' : 'Create Invoice'}
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium">
                        {isEdit ? 'Modify billing for this invoice.' : 'Batch orders and create a formal billing statement.'}
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
                                    <User className="h-5 w-5 text-primary" />
                                    Billing Context
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="resellerId">Reseller / Bill To</Label>
                                    <Combobox
                                        options={resellers?.map(reseller => ({ label: reseller.resellerName, value: reseller.id })) || []}
                                        value={formData.resellerId}
                                        onChange={(value) => handleSelectChange('resellerId', value.toString())}
                                        disabled={isEdit}
                                        placeholder="Select reseller to bill"
                                        searchPlaceholder="Search resellers..."
                                        emptyMessage="No reseller found."
                                    />
                                    {isEdit && <p className="text-[10px] text-muted-foreground">Reseller cannot be changed after invoice creation.</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="invoiceStatus">Payment Status</Label>
                                    <Select
                                        value={formData.invoiceStatus}
                                        onValueChange={(v) => handleSelectChange('invoiceStatus', v)}
                                    >
                                        <SelectTrigger id="invoiceStatus">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Pending Payment (Draft)</SelectItem>
                                            <SelectItem value="paid">Paid Full</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <ShoppingCart className="h-5 w-5 text-primary" />
                                        Included Orders
                                    </CardTitle>
                                    <CardDescription>Select the orders to batch in this invoice.</CardDescription>
                                </div>
                                <Badge variant="secondary" className="h-6">
                                    {currentOrderIds.length} Selected
                                </Badge>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {!formData.resellerId ? (
                                    <div className="py-12 text-center bg-muted/30 rounded-lg border-2 border-dashed">
                                        <Package className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-20" />
                                        <p className="text-sm text-muted-foreground">Select a reseller first to see their orders.</p>
                                    </div>
                                ) : availableOrders.length === 0 ? (
                                    <div className="py-12 text-center bg-muted/30 rounded-lg border-2 border-dashed">
                                        <Package className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-20" />
                                        <p className="text-sm text-muted-foreground">This reseller doesn't have any orders yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2">
                                        {availableOrders.map(order => {
                                            const isSelected = currentOrderIds.includes(order.id);
                                            return (
                                                <div
                                                    key={order.id}
                                                    onClick={() => toggleOrder(order.id)}
                                                    className={cn(
                                                        "group flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all",
                                                        isSelected
                                                            ? "bg-primary/5 border-primary"
                                                            : "bg-background border-border hover:border-primary/50"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "h-10 w-10 rounded bg-secondary flex items-center justify-center shrink-0 border transition-colors",
                                                            isSelected ? "bg-primary/20 border-primary/30" : ""
                                                        )}>
                                                            {order.orderImage ? (
                                                                <img src={order.orderImage} className="h-full w-full object-cover" alt="" />
                                                            ) : (
                                                                <Package className="h-5 w-5 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold group-hover:text-primary transition-colors">{order.orderName}</p>
                                                            <p className="text-[10px] text-muted-foreground">#{order.id} • {new Date(order.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <p className="text-sm font-bold">{formatCurrency(order.orderResellerTotal)}</p>
                                                        <div className={cn(
                                                            "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                                                            isSelected ? "bg-primary border-primary" : "border-muted"
                                                        )}>
                                                            {isSelected && <Check className="h-3 w-3 text-white" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="bg-gradient-to-br from-card to-secondary/30 border-none shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-lg">Invoice Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal ({currentOrderIds.length} items)</span>
                                    <span>{formatCurrency(formData.invoiceTotal || 0)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax / Fees</span>
                                    <span>{formatCurrency(0)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-end">
                                    <span className="font-bold">Total Amount</span>
                                    <span className="text-2xl font-black text-primary">{formatCurrency(formData.invoiceTotal || 0)}</span>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-3">
                                <Button
                                    className="w-full h-11 shadow-lg shadow-primary/20"
                                    type="submit"
                                    disabled={mutationLoading || currentOrderIds.length === 0}
                                >
                                    {mutationLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <FileCheck className="mr-2 h-4 w-4" />
                                            {isEdit ? 'Update Invoice' : 'Create Invoice'}
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full h-11"
                                    type="button"
                                    onClick={() => navigate('/invoices')}
                                >
                                    Cancel
                                </Button>
                            </CardFooter>
                        </Card>

                        <Alert className="bg-amber-500/5 border-amber-500/20 text-xs">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            <AlertTitle className="text-amber-500">Notice</AlertTitle>
                            <AlertDescription>
                                Generating an invoice will consolidate the totals of all selected orders.
                            </AlertDescription>
                        </Alert>
                    </div>
                </form>
            </main>
        </div>
    );
};
