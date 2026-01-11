import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    Search,
    MapPin,
    Phone,
    Loader2,
    CheckSquare,
    Truck,
    X,
    Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    BottomSheet,
    BottomSheetHeader,
    BottomSheetTitle,
    BottomSheetDescription,
    BottomSheetFooter
} from '@/components/ui/BottomSheet';
import { HeaderContent } from '@/components/layout/HeaderProvider';
import { EmptyState } from '@/components/EmptyState';
import { ordersApi, shipmentsApi } from '@/lib/api';
import type { ShippingListGroup, BuyListOrder, Order } from '@/lib/types';
import { OrderCard } from '../orders/OrderCard';

export const ShipmentCustomerPage: React.FC = () => {
    const { customerId } = useParams<{ customerId: string }>();
    const navigate = useNavigate();
    const [customerGroup, setCustomerGroup] = useState<ShippingListGroup | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Selection state
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set());
    const [isShipSheetOpen, setIsShipSheetOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const fetchCustomerData = useCallback(async () => {
        if (!customerId) return;

        setIsLoading(true);
        setError(null);
        try {
            const response = await ordersApi.getShippingList();
            if (response.success && response.data) {
                const group = response.data.find(g => g.customer.id === parseInt(customerId));
                if (group) {
                    setCustomerGroup(group);
                } else {
                    setCustomerGroup(null);
                }
            } else {
                setError(response.error || 'Failed to load data');
            }
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        fetchCustomerData();
    }, [fetchCustomerData]);

    const handleSelect = (orderId: number) => {
        if (!isSelectionMode) {
            setIsSelectionMode(true);
            setSelectedOrders(new Set([orderId]));
            return;
        }

        const newSelected = new Set(selectedOrders);
        if (newSelected.has(orderId)) {
            newSelected.delete(orderId);
            if (newSelected.size === 0) {
                setIsSelectionMode(false);
            }
        } else {
            newSelected.add(orderId);
        }
        setSelectedOrders(newSelected);
    };

    const handleCreateShipmentClick = () => {
        if (selectedOrders.size === 0) return;
        setIsShipSheetOpen(true);
    };

    const handleConfirmShipment = async () => {
        if (!customerGroup || selectedOrders.size === 0) return;

        setIsCreating(true);
        try {
            const result = await shipmentsApi.create({
                customerId: customerGroup.customer.id,
                orderIds: Array.from(selectedOrders),
            });

            if (result.success && result.data) {
                // Navigate to the new shipment details
                navigate(`/shipments/${result.data.id}`);
            } else {
                setError(result.error || 'Failed to create shipment');
            }
        } catch (e) {
            console.error('Failed to create shipment', e);
            setError('Failed to create shipment');
        } finally {
            setIsCreating(false);
            setIsShipSheetOpen(false);
        }
    };

    const toggleSelectionMode = () => {
        if (isSelectionMode) {
            setIsSelectionMode(false);
            setSelectedOrders(new Set());
        } else {
            setIsSelectionMode(true);
        }
    };

    const selectAll = () => {
        if (!customerGroup) return;
        const allIds = customerGroup.orders.map(o => o.id);
        setSelectedOrders(new Set(allIds));
        setIsSelectionMode(true);
    };

    // Filter orders
    const filteredOrders = customerGroup?.orders.filter(order =>
        order.orderName.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    // Helper to adapt BuyListOrder to Order
    const adaptToOrder = (buyListOrder: BuyListOrder): Order => {
        return {
            ...buyListOrder,
            storeName: buyListOrder.storeName || '',
            customerName: buyListOrder.customerName || '',
            orderCustomerTotal: buyListOrder.orderTotal || 0,
            id: buyListOrder.id,
            orderNumber: buyListOrder.orderNumber,
            orderName: buyListOrder.orderName,
            orderQuantity: buyListOrder.orderQuantity,
            orderPrice: buyListOrder.orderPrice,
            orderTotal: buyListOrder.orderTotal || 0,
            orderStatus: buyListOrder.orderStatus,
            storeId: buyListOrder.storeId,
            customerId: buyListOrder.customerId,
            userId: null,
            orderFee: 0,
            orderCustomerPrice: 0,
            orderDate: buyListOrder.orderDate || new Date().toISOString(),
            createdAt: buyListOrder.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            orderImages: buyListOrder.orderImages || (buyListOrder.orderImage ? [buyListOrder.orderImage] : [])
        } as unknown as Order;
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Loading orders...</p>
            </div>
        );
    }

    if (error || !customerGroup) {
        return (
            <div className="p-4">
                <Button
                    variant="ghost"
                    className="mb-4"
                    onClick={() => navigate('/shipments')}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Shipments
                </Button>
                <EmptyState
                    icon={<User className="h-10 w-10 text-muted-foreground" />}
                    title="No orders found"
                    description={error || "All packed orders have been shipped for this customer."}
                />
            </div>
        );
    }

    return (
        <div className="pb-32">
            <HeaderContent
                title={isSelectionMode ? `${selectedOrders.size} Selected` : customerGroup.customer.customerName}
                showSearch={!isSelectionMode}
                searchPlaceholder="Search orders..."
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                actions={
                    <div className="flex items-center gap-1">
                        {isSelectionMode ? (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={selectAll}
                                >
                                    Select All
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toggleSelectionMode()}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toggleSelectionMode()}
                                    className={isSelectionMode ? 'text-primary' : ''}
                                >
                                    <CheckSquare className="h-5 w-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigate('/shipments')}
                                    className="rounded-full hover:bg-secondary"
                                >
                                    <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                                </Button>
                            </>
                        )}
                    </div>
                }
            />

            {/* Customer Header Info */}
            {!isSelectionMode && (
                <div className="px-4 mb-4">
                    <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-border/50">
                        <div className="flex items-start gap-4">
                            <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden border border-border/10">
                                {customerGroup.customer.customerPhoto ? (
                                    <img
                                        src={customerGroup.customer.customerPhoto}
                                        alt={customerGroup.customer.customerName}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <User className="h-8 w-8 text-muted-foreground/50" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0 py-1">
                                <h1 className="text-xl font-bold text-foreground truncate leading-tight mb-1">
                                    {customerGroup.customer.customerName}
                                </h1>
                                {customerGroup.customer.customerAddress && (
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span className="truncate">{customerGroup.customer.customerAddress}</span>
                                    </div>
                                )}
                                {customerGroup.customer.customerPhone && (
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                                        <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span>{customerGroup.customer.customerPhone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="inline-flex items-center gap-1 text-primary font-medium">
                                        <Package className="h-3.5 w-3.5" />
                                        {customerGroup.orderCount} Ready to Ship
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Orders List */}
            <div className="px-4 space-y-4">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={adaptToOrder(order)}
                            onDelete={() => { }}
                            onStatusChange={() => { }}
                            showStore={true}
                            hideCustomer={true}
                            hidePrice={true}
                            showQuantity={true}
                            selectable={isSelectionMode}
                            selected={selectedOrders.has(order.id)}
                            onSelect={() => handleSelect(order.id)}
                            allowedStatuses={[]} // No status changes - orders auto-transition to shipped
                        />
                    ))
                ) : (
                    <div className="pt-8">
                        <EmptyState
                            icon={<Search className="h-10 w-10" />}
                            title="No orders found"
                            description={searchQuery ? `No orders match "${searchQuery}"` : "This customer has no packed orders to ship."}
                        />
                    </div>
                )}
            </div>

            {/* Floating Action Bar for Bulk Actions */}
            {isSelectionMode && selectedOrders.size > 0 && (
                <div className="fixed bottom-24 left-4 right-4 z-40">
                    <div className="bg-card text-card-foreground rounded-full shadow-xl border border-border/50 p-2 flex items-center justify-between pl-6 animate-in slide-in-from-bottom-5">
                        <span className="font-bold text-sm">
                            {selectedOrders.size} selected
                        </span>
                        <Button
                            onClick={handleCreateShipmentClick}
                            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-6"
                        >
                            <Truck className="h-4 w-4 mr-2" />
                            Create Shipment
                        </Button>
                    </div>
                </div>
            )}

            <BottomSheet open={isShipSheetOpen} onOpenChange={setIsShipSheetOpen}>
                <BottomSheetHeader>
                    <BottomSheetTitle>Create Shipment</BottomSheetTitle>
                    <BottomSheetDescription>
                        You are about to create a shipment with {selectedOrders.size} order(s) for {customerGroup.customer.customerName}.
                    </BottomSheetDescription>
                </BottomSheetHeader>

                <div className="py-4">
                    <div className="bg-secondary/30 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Customer</span>
                            <span className="font-medium">{customerGroup.customer.customerName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Orders</span>
                            <span className="font-medium">{selectedOrders.size}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Carrier</span>
                            <span className="font-medium">Self Delivery (default)</span>
                        </div>
                    </div>
                </div>

                <BottomSheetFooter>
                    <Button
                        size="lg"
                        onClick={handleConfirmShipment}
                        disabled={isCreating}
                        className="w-full font-bold text-lg h-12 rounded-xl"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Truck className="h-4 w-4 mr-2" />
                                Create Shipment
                            </>
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => setIsShipSheetOpen(false)}
                        className="w-full text-muted-foreground h-12 rounded-xl"
                    >
                        Cancel
                    </Button>
                </BottomSheetFooter>
            </BottomSheet>
        </div>
    );
};
