import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Package,
    Truck,
    Copy,
    Check,
    MapPin,
    Phone,
    Loader2,
    MoreVertical,
    Trash2,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderContent } from '@/components/layout/HeaderProvider';
import { shipmentsApi } from '@/lib/api';
import type { ShipmentWithOrders, ShipmentStatus } from '@/lib/types';
import { DeleteConfirmationSheet } from '@/components/ui/DeleteConfirmationSheet';
import { useIsMobile } from '@/hooks/useMediaQuery';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    BottomSheet,
    BottomSheetHeader,
    BottomSheetTitle,
} from '@/components/ui/BottomSheet';

const statusColors: Record<ShipmentStatus, { bg: string; text: string; label: string }> = {
    preparing: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Preparing' },
    ready: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Ready' },
    in_transit: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', label: 'In Transit' },
    delivered: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Delivered' },
    cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Cancelled' },
};

const carrierLabels: Record<string, string> = {
    lbc: 'LBC',
    jt: 'J&T',
    grab: 'Grab',
    lalamove: 'Lalamove',
    self: 'Self Delivery',
    other: 'Other',
};

const statusFlow: ShipmentStatus[] = ['preparing', 'ready', 'in_transit', 'delivered'];

export const ShipmentDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const [shipment, setShipment] = useState<ShipmentWithOrders | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showStatusSheet, setShowStatusSheet] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchShipment = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await shipmentsApi.get(parseInt(id));
            if (response.success && response.data) {
                setShipment(response.data);
            } else {
                setError(response.error || 'Failed to load shipment');
            }
        } catch (err) {
            setError('Failed to load shipment');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchShipment();
    }, [fetchShipment]);

    const handleCopyTracking = () => {
        if (shipment) {
            navigator.clipboard.writeText(shipment.trackingNumber);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleStatusChange = async (newStatus: ShipmentStatus) => {
        if (!shipment) return;
        setIsUpdating(true);
        try {
            const response = await shipmentsApi.updateStatus(shipment.id, newStatus);
            if (response.success) {
                setShipment(prev => prev ? { ...prev, shipmentStatus: newStatus } : null);
            }
        } finally {
            setIsUpdating(false);
            setShowStatusSheet(false);
        }
    };

    const handleDelete = async () => {
        if (!shipment) return;
        await shipmentsApi.delete(shipment.id);
        navigate('/shipments');
    };

    const formatCurrency = (amount: number | null) => {
        if (amount === null) return '₱0.00';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Loading shipment...</p>
            </div>
        );
    }

    if (error || !shipment) {
        return (
            <div className="p-8 text-center">
                <p className="text-destructive mb-4">{error || 'Shipment not found'}</p>
                <Button onClick={() => navigate('/shipments')}>Back to Shipments</Button>
            </div>
        );
    }

    const statusStyle = statusColors[shipment.shipmentStatus];

    return (
        <div className="relative pb-24">
            <HeaderContent
                title="Shipment Details"
                actions={
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setShowStatusSheet(true)}>
                                <Truck className="h-4 w-4 mr-2" />
                                Update Status
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setShowDelete(true)} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Shipment
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                }
            />

            <main className="px-4 space-y-4">
                {/* Tracking Card */}
                <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-border/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Package className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Tracking Number</p>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-lg font-semibold">{shipment.trackingNumber}</span>
                                    <button
                                        onClick={handleCopyTracking}
                                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                                    >
                                        {copied ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                            {statusStyle.label}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
                        <div>
                            <p className="text-xs text-muted-foreground">Carrier</p>
                            <p className="font-medium">{carrierLabels[shipment.carrier] || shipment.carrier}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Shipping Fee</p>
                            <p className="font-medium">{formatCurrency(shipment.shippingFee)}</p>
                        </div>
                    </div>
                </div>

                {/* Customer Card */}
                <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-border/50">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Recipient</h3>
                    <p className="text-lg font-semibold mb-2">{shipment.customerName}</p>
                    {shipment.customerAddress && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{shipment.customerAddress}</span>
                        </div>
                    )}
                    {shipment.customerPhone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{shipment.customerPhone}</span>
                        </div>
                    )}
                </div>

                {/* Orders List */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border/50 overflow-hidden">
                    <div className="p-4 border-b border-border/50">
                        <h3 className="font-semibold">Orders ({shipment.orders?.length || 0})</h3>
                    </div>
                    <div className="divide-y divide-border/50">
                        {shipment.orders?.map((order) => (
                            <div
                                key={order.id}
                                onClick={() => navigate(`/orders/${order.id}`)}
                                className="p-4 flex items-center gap-3 cursor-pointer hover:bg-secondary/20 transition-colors"
                            >
                                {order.orderImage ? (
                                    <img
                                        src={order.orderImage}
                                        alt={order.orderName}
                                        className="h-12 w-12 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                                        <Package className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{order.orderName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Qty: {order.orderQuantity} • {formatCurrency(order.orderCustomerTotal)}
                                    </p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                {shipment.notes && (
                    <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-border/50">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
                        <p className="text-sm">{shipment.notes}</p>
                    </div>
                )}
            </main>

            {/* Status Update Sheet */}
            <BottomSheet
                open={showStatusSheet}
                onOpenChange={setShowStatusSheet}
            >
                <BottomSheetHeader>
                    <BottomSheetTitle>Update Status</BottomSheetTitle>
                </BottomSheetHeader>
                <div className="space-y-2">
                    {statusFlow.map((status) => {
                        const style = statusColors[status];
                        const isActive = shipment.shipmentStatus === status;
                        return (
                            <button
                                key={status}
                                onClick={() => handleStatusChange(status)}
                                disabled={isUpdating}
                                className={`w-full p-4 rounded-xl text-left flex items-center justify-between transition-colors ${isActive
                                    ? 'bg-primary/10 border-2 border-primary'
                                    : 'bg-secondary/50 hover:bg-secondary'
                                    }`}
                            >
                                <span className="font-medium">{style.label}</span>
                                {isActive && <Check className="h-5 w-5 text-primary" />}
                            </button>
                        );
                    })}
                </div>
            </BottomSheet>

            {/* Delete Confirmation */}
            {isMobile ? (
                <DeleteConfirmationSheet
                    open={showDelete}
                    onOpenChange={setShowDelete}
                    title="Delete Shipment?"
                    description="This will remove the shipment and unlink all associated orders."
                    onConfirm={handleDelete}
                />
            ) : (
                <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Shipment?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will remove the shipment and unlink all associated orders.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
};
