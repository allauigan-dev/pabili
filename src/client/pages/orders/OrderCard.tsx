import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Trash2,
    Edit,
    Store,
    User,
    CheckCircle,
    PackageCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import type { Order, OrderStatus } from '@/lib/types';
import { ImageGallery } from '@/components/ui/ImageGallery';
import { ActionSheet } from '@/components/ui/ActionSheet';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { SwipeableCard, createQuickAction, type SwipeAction } from '@/components/ui/SwipeableCard';


interface OrderCardProps {
    order: Order;
    onDelete: (id: number) => void;
    onStatusChange: (id: number, status: OrderStatus) => void;
    showStore?: boolean;
    hideCustomer?: boolean;
    hidePrice?: boolean;
    showQuantity?: boolean;
    selectable?: boolean;
    selected?: boolean;
    onSelect?: () => void;
    /** Limit which status options are shown. If not provided, uses default flow logic. */
    allowedStatuses?: OrderStatus[];
    /** Custom swipe-right action. If provided, overrides the default quick status action. */
    swipeRightAction?: SwipeAction;
}

export const OrderCard: React.FC<OrderCardProps> = ({
    order,
    onDelete,
    onStatusChange,
    showStore = true,
    hideCustomer = false,
    hidePrice = false,
    showQuantity = false,
    selectable = false,
    selected = false,
    onSelect,
    allowedStatuses,
    swipeRightAction
}) => {
    const navigate = useNavigate();

    const statusConfig = {
        pending: {
            bar: 'bg-amber-400',
            badge: 'bg-amber-100 text-amber-800',
            label: 'PENDING'
        },
        bought: {
            bar: 'bg-purple-500',
            badge: 'bg-purple-100 text-purple-800',
            label: 'BOUGHT'
        },
        packed: {
            bar: 'bg-blue-500',
            badge: 'bg-blue-100 text-blue-800',
            label: 'PACKED'
        },
        shipped: {
            bar: 'bg-cyan-500',
            badge: 'bg-cyan-100 text-cyan-800',
            label: 'SHIPPED'
        },
        delivered: {
            bar: 'bg-emerald-500',
            badge: 'bg-emerald-100 text-emerald-800',
            label: 'DELIVERED'
        },
        cancelled: {
            bar: 'bg-red-500',
            badge: 'bg-red-100 text-red-800',
            label: 'CANCELLED'
        },
        no_stock: {
            bar: 'bg-gray-500',
            badge: 'bg-gray-100 text-gray-800',
            label: 'NO STOCK'
        }
    };

    const status = statusConfig[order.orderStatus as keyof typeof statusConfig] || statusConfig.pending;
    const isMobile = useIsMobile();
    const [open, setOpen] = React.useState(false);
    const [galleryOpen, setGalleryOpen] = React.useState(false);

    // Get images array (handle both single and multiple formats)
    const images = order.orderImages && order.orderImages.length > 0
        ? order.orderImages
        : order.orderImage
            ? [order.orderImage]
            : [];


    // Filter valid next statuses based on current status
    const getValidNextStatuses = (currentStatus: string): string[] => {
        const flow: Record<string, string[]> = {
            pending: ['bought', 'cancelled', 'no_stock'],
            bought: ['packed', 'cancelled'],
            packed: ['shipped'],
            shipped: ['delivered'],
            delivered: [], // Terminal state
            cancelled: [], // Terminal state
            no_stock: ['pending'] // Can retry if stock comes back
        };
        return flow[currentStatus] || [];
    };

    // Get valid statuses - either from prop or from flow logic
    const validStatuses = allowedStatuses || getValidNextStatuses(order.orderStatus);

    const handleStatusSelect = (newStatus: string) => {
        onStatusChange(order.id, newStatus as OrderStatus);
        setOpen(false);
    };

    // Quick action: advance to next logical status
    const getQuickStatusAction = useCallback(() => {
        // Quick status progression: pending -> bought -> packed -> shipped -> delivered
        const quickFlow: Record<string, OrderStatus> = {
            pending: 'bought',
            bought: 'packed',
            packed: 'shipped',
            shipped: 'delivered',
        };
        return quickFlow[order.orderStatus] || null;
    }, [order.orderStatus]);

    const quickStatus = getQuickStatusAction();
    const quickStatusLabel = quickStatus ? statusConfig[quickStatus]?.label || quickStatus : null;

    // Swipe actions
    const editAction = {
        icon: <Edit className="h-5 w-5" />,
        label: 'Edit',
        color: 'text-white',
        bgColor: 'bg-blue-600',
        onAction: () => navigate(`/orders/${order.id}/edit`),
    };

    const quickAction = quickStatus ? createQuickAction(
        <PackageCheck className="h-5 w-5" />,
        quickStatusLabel || 'Next',
        () => onStatusChange(order.id, quickStatus),
    ) : undefined;

    // Use custom swipe right action if provided, otherwise use default quick action
    const leftSwipeAction = swipeRightAction || quickAction;

    return (
        <SwipeableCard
            rightAction={editAction}
            leftAction={leftSwipeAction}
            className="mb-4"
        >
            <div
                className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 shadow-soft border border-border/50 relative group overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => {
                    if (selectable && onSelect) {
                        onSelect();
                    } else {
                        navigate(`/orders/${order.id}`);
                    }
                }}
            >
                {/* Status Strip (hide if selectable, or keep?) - Keep for visual context */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${status.bar} rounded-l-2xl`}></div>

                <div className="flex gap-4">
                    {/* Selection Checkbox */}
                    {selectable && (
                        <div className="flex items-center justify-center pl-2">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selected ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                                {selected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                            </div>
                        </div>
                    )}

                    {/* Image Section */}
                    <div className="flex-shrink-0 w-20 h-20 bg-secondary/30 rounded-xl overflow-hidden border border-border/50 relative">
                        <span className={`absolute top-0 right-0 text-[9px] font-bold px-1.5 py-0.5 rounded-bl-md z-10 ${status.badge}`}>
                            {status.label}
                        </span>

                        {images.length > 0 ? (
                            <>
                                <div className="w-full h-full cursor-zoom-in" onClick={(e) => { e.stopPropagation(); setGalleryOpen(true); }}>
                                    <img
                                        src={images[0]}
                                        alt={order.orderName}
                                        className="w-full h-full object-cover"
                                    />
                                    {images.length > 1 && (
                                        <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm text-white text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                                            <span>+{images.length - 1}</span>
                                        </div>
                                    )}
                                </div>

                                <ImageGallery
                                    images={images}
                                    open={galleryOpen}
                                    onOpenChange={setGalleryOpen}
                                    title={order.orderName}
                                />
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-secondary/30">
                                <span className="text-xs text-muted-foreground text-center px-1 font-medium uppercase tracking-tighter">NO IMAGE</span>
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                        <div className="flex justify-between items-start">
                            {/* Left Side: Info */}
                            <div className="min-w-0 pr-2">
                                <h3 className="text-base font-bold text-foreground truncate">{order.orderName}</h3>
                                <div className="flex flex-col mt-1">
                                    {!hideCustomer && (
                                        <span className="flex items-center text-xs text-muted-foreground truncate">
                                            <User className="h-3.5 w-3.5 mr-1 opacity-70" />
                                            {order.customerName}
                                        </span>
                                    )}
                                    {showStore && (
                                        <span className="flex items-center text-[10px] text-muted-foreground/80 mt-0.5 truncate uppercase tracking-wider font-medium">
                                            <Store className="h-3 w-3 mr-1 opacity-70" />
                                            {order.storeName}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Right Side: Price and Actions */}
                            <div className="flex flex-col items-end">
                                {!hidePrice && (
                                    <p className="text-primary font-bold text-base whitespace-nowrap">
                                        {formatCurrency(order.orderCustomerTotal ?? 0)}
                                    </p>
                                )}
                                {showQuantity && (
                                    <p className="text-foreground font-bold text-lg whitespace-nowrap flex items-center gap-1">
                                        <span className="text-xs text-muted-foreground font-normal uppercase">Qty</span>
                                        {order.orderQuantity}
                                    </p>
                                )}

                                <div className="flex items-center mt-2 space-x-0.5" onClick={(e) => e.stopPropagation()}>
                                    {!selectable && validStatuses.length > 0 && (
                                        <>
                                            {isMobile ? (
                                                <ActionSheet
                                                    open={open}
                                                    onOpenChange={setOpen}
                                                    title="Update Status"
                                                    actions={validStatuses.map((key) => {
                                                        const config = statusConfig[key as keyof typeof statusConfig];
                                                        return {
                                                            label: config.label,
                                                            icon: <div className={`w-3 h-3 rounded-full ${config.bar}`} />,
                                                            onAction: () => onStatusChange(order.id, key as OrderStatus),
                                                        };
                                                    })}
                                                />
                                            ) : (
                                                <Dialog open={open} onOpenChange={setOpen}>
                                                    <DialogContent className="sm:max-w-md">
                                                        <DialogTitle>Update Status</DialogTitle>
                                                        <div className="grid gap-2 py-4">
                                                            {validStatuses.map((key) => {
                                                                const config = statusConfig[key as keyof typeof statusConfig];
                                                                return (
                                                                    <Button
                                                                        key={key}
                                                                        variant="outline"
                                                                        className="w-full justify-start hover:bg-secondary"
                                                                        onClick={() => handleStatusSelect(key)}
                                                                    >
                                                                        <div className={`w-3 h-3 rounded-full mr-2 ${config.bar}`} />
                                                                        {config.label}
                                                                    </Button>
                                                                );
                                                            })}
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                                                onClick={() => setOpen(true)}
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                                        onClick={() => navigate(`/orders/${order.id}/edit`)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                                        onClick={() => onDelete(order.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SwipeableCard>
    );
};
