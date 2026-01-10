import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Store,
    Search,
    MapPin,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderContent } from '@/components/layout/HeaderProvider';
import { EmptyState } from '@/components/EmptyState';
import { ordersApi } from '@/lib/api';
import { useOrderMutations } from '@/hooks/useOrders';
import type { BuyListStoreGroup, BuyListOrder, Order, OrderStatus } from '@/lib/types';
import { OrderCard } from './OrderCard';

export const BuyListStorePage: React.FC = () => {
    const { storeId } = useParams<{ storeId: string }>();
    const navigate = useNavigate();
    const [storeGroup, setStoreGroup] = useState<BuyListStoreGroup | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { updateStatusAction, deleteAction } = useOrderMutations();

    const fetchStoreData = useCallback(async () => {
        if (!storeId) return;

        setIsLoading(true);
        setError(null);
        try {
            // Since we don't have a single store buy list endpoint, we fetch all and filter
            const response = await ordersApi.getBuyList();
            if (response.success && response.data) {
                const group = response.data.find(g => g.store.id === parseInt(storeId));
                if (group) {
                    setStoreGroup(group);
                } else {
                    setError('Store not found in buy list');
                }
            } else {
                setError(response.error || 'Failed to load data');
            }
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    }, [storeId]);

    useEffect(() => {
        fetchStoreData();
    }, [fetchStoreData]);

    const handleStatusChange = async (orderId: number, status: OrderStatus) => {
        await updateStatusAction({ id: orderId, status });
        // Refresh local state or re-fetch
        fetchStoreData();
    };

    const handleDelete = async (orderId: number) => {
        if (!confirm('Are you sure you want to delete this order?')) return;
        await deleteAction(orderId);
        fetchStoreData();
    };

    // Filter orders
    const filteredOrders = storeGroup?.orders.filter(order =>
        order.orderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    // Helper to adapt BuyListOrder to Order
    const adaptToOrder = (buyListOrder: BuyListOrder): Order => {
        return {
            ...buyListOrder,
            storeName: buyListOrder.storeName || '',
            customerName: buyListOrder.customerName || '',
            // Map missing fields for display logic in OrderCard
            orderCustomerTotal: buyListOrder.orderTotal || 0,

            // Required fields for type satisfaction
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
                <p className="text-muted-foreground">Loading store orders...</p>
            </div>
        );
    }

    if (error || !storeGroup) {
        return (
            <div className="p-4">
                <Button
                    variant="ghost"
                    className="mb-4"
                    onClick={() => navigate('/buy-list')}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Buy List
                </Button>
                <EmptyState
                    icon={<Store className="h-10 w-10 text-muted-foreground" />}
                    title="Store not found"
                    description={error || "Could not find orders for this store."}
                />
            </div>
        );
    }

    return (
        <div className="pb-24">
            <HeaderContent
                title={storeGroup.store.storeName || 'Store Orders'}
                showSearch={true}
                searchPlaceholder="Search orders..."
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                actions={
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/buy-list')}
                        className="rounded-full hover:bg-secondary"
                    >
                        <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                    </Button>
                }
            />

            {/* Store Header Info */}
            <div className="px-4 mb-4">
                <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-border/50">
                    <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden border border-border/10">
                            {storeGroup.store.storeLogo ? (
                                <img
                                    src={storeGroup.store.storeLogo}
                                    alt={storeGroup.store.storeName || ''}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <Store className="h-8 w-8 text-muted-foreground/50" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0 py-1">
                            <h1 className="text-xl font-bold text-foreground truncate leading-tight mb-1">
                                {storeGroup.store.storeName}
                            </h1>
                            {storeGroup.store.storeAddress && (
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span className="truncate">{storeGroup.store.storeAddress}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-primary font-medium">
                                    {storeGroup.orderCount} orders
                                </span>
                                <span className="text-muted-foreground">
                                    • {storeGroup.totalItems} items
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="px-4">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={adaptToOrder(order)}
                            onDelete={handleDelete}
                            onStatusChange={handleStatusChange}
                            showStore={false}
                        />
                    ))
                ) : (
                    <div className="pt-8">
                        <EmptyState
                            icon={<Search className="h-10 w-10" />}
                            title="No orders found"
                            description={searchQuery ? `No orders match "${searchQuery}"` : "This store has no pending orders."}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
