import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    Search,
    MapPin,
    Loader2,
    CheckSquare,
    PackageCheck,
    X,
    Camera
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
import { ordersApi } from '@/lib/api';
import { useOrderMutations } from '@/hooks/useOrders';
import type { PackagingListGroup, BuyListOrder, Order, OrderStatus } from '@/lib/types';
import { OrderCard } from './OrderCard';
// import { toast } from 'sonner';

export const PackagingCustomerPage: React.FC = () => {
    const { customerId } = useParams<{ customerId: string }>();
    const navigate = useNavigate();
    const [customerGroup, setCustomerGroup] = useState<PackagingListGroup | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Selection state
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set());

    const { updateStatusAction } = useOrderMutations();

    const fetchCustomerData = useCallback(async () => {
        if (!customerId) return;

        setIsLoading(true);
        setError(null);
        try {
            // Fetch packaging list and find the group
            const response = await ordersApi.getPackagingList();
            if (response.success && response.data) {
                const group = response.data.find(g => g.customer.id === parseInt(customerId));
                if (group) {
                    setCustomerGroup(group);
                } else {
                    // If not found, it might be partial navigation or no orders left
                    // You could check if there are no orders and redirect, but let's show empty state or error
                    // Actually if user just packed everything, this group disappears.
                    if (response.data.length > 0) {
                        setError('Customer not found in packaging list (maybe all packed?)');
                    } else {
                        // Redirect if list is empty? Or just show empty.
                        setCustomerGroup(null);
                    }
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

    const [isPackSheetOpen, setIsPackSheetOpen] = useState(false);

    useEffect(() => {
        fetchCustomerData();
    }, [fetchCustomerData]);

    const handleStatusChange = async (orderId: number, status: OrderStatus) => {
        await updateStatusAction({ id: orderId, status });
        fetchCustomerData(); // Refresh list
    };

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

    const handleBulkPackClick = () => {
        if (selectedOrders.size === 0) return;
        setIsPackSheetOpen(true);
    };

    const handleConfirmPack = async () => {
        setIsPackSheetOpen(false);

        let successCount = 0;
        const promises = Array.from(selectedOrders).map(async (id) => {
            try {
                const result = await ordersApi.updateStatus(id, 'packed');
                if (result.success) successCount++;
            } catch (e) {
                console.error(`Failed to pack order ${id}`, e);
            }
        });

        await Promise.all(promises);

        // toast.success(`Packed ${successCount} orders`);
        // Use alert for now since sonner is not installed
        if (successCount > 0) {
            // alert(`Successfully packed ${successCount} orders`);
        }
        setSelectedOrders(new Set());
        setIsSelectionMode(false);
        fetchCustomerData();
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

            // Allow OrderCard to handle missing fields cleanly if needed
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
                    onClick={() => navigate('/packaging')}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Packaging List
                </Button>
                <EmptyState
                    icon={<User className="h-10 w-10 text-muted-foreground" />}
                    title="No orders found"
                    description={error || "All orders have been packed for this customer."}
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
                                    onClick={() => navigate('/packaging')}
                                    className="rounded-full hover:bg-secondary"
                                >
                                    <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                                </Button>
                            </>
                        )}
                    </div>
                }
            />

            {/* Customer Header Info (Hide if selection mode maybe? No keep it) */}
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
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span className="truncate">{customerGroup.customer.customerAddress}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-primary font-medium">
                                        {customerGroup.orderCount} Pending Pack
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
                            onDelete={() => { }} // Disable delete here? Or allow
                            onStatusChange={handleStatusChange}
                            showStore={true}
                            hideCustomer={true} // As requested
                            hidePrice={true} // As requested
                            showQuantity={true} // As requested
                            selectable={isSelectionMode}
                            selected={selectedOrders.has(order.id)}
                            onSelect={() => handleSelect(order.id)}
                        />
                    ))
                ) : (
                    <div className="pt-8">
                        <EmptyState
                            icon={<Search className="h-10 w-10" />}
                            title="No orders found"
                            description={searchQuery ? `No orders match "${searchQuery}"` : "This customer has no orders to pack."}
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
                            onClick={handleBulkPackClick}
                            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-6"
                        >
                            <PackageCheck className="h-4 w-4 mr-2" />
                            Mark Packed
                        </Button>
                    </div>
                </div>
            )}

            <BottomSheet open={isPackSheetOpen} onOpenChange={setIsPackSheetOpen}>
                <BottomSheetHeader>
                    <BottomSheetTitle>Confirm Packing</BottomSheetTitle>
                    <BottomSheetDescription>
                        You are about to mark {selectedOrders.size} orders as packed.
                    </BottomSheetDescription>
                </BottomSheetHeader>

                <div className="py-6 flex flex-col items-center justify-center gap-4">
                    <div className="h-24 w-full bg-secondary/30 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-secondary/50 transition-colors">
                        <Camera className="h-8 w-8 mb-2 opacity-50" />
                        <span className="text-xs font-medium">Upload packing photo (Optional)</span>
                    </div>
                </div>

                <BottomSheetFooter>
                    <Button
                        size="lg"
                        onClick={handleConfirmPack}
                        className="w-full font-bold text-lg h-12 rounded-xl"
                    >
                        Confirm & Mark Packed
                    </Button>
                    <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => setIsPackSheetOpen(false)}
                        className="w-full text-muted-foreground h-12 rounded-xl"
                    >
                        Cancel
                    </Button>
                </BottomSheetFooter>
            </BottomSheet>
        </div>
    );
};
