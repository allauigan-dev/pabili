import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    RefreshCcw,
    ShoppingBasket,
    Loader2,
    Search,
    Store,
    ChevronRight,
    MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderContent } from '@/components/layout/HeaderProvider';
import { EmptyState } from '@/components/EmptyState';
import { ordersApi } from '@/lib/api';
import type { BuyListStoreGroup } from '@/lib/types';

export const BuyListPage: React.FC = () => {
    const navigate = useNavigate();
    const [storeGroups, setStoreGroups] = useState<BuyListStoreGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchBuyList = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await ordersApi.getBuyList();
            if (response.success && response.data) {
                setStoreGroups(response.data);
            } else {
                setError(response.error || 'Failed to load buy list');
            }
        } catch (err) {
            setError('Failed to load buy list');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBuyList();
    }, [fetchBuyList]);

    // Filter store groups by search query
    const filteredGroups = searchQuery
        ? storeGroups.filter(group =>
            group.store.storeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.orders.some(order =>
                order.orderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
        : storeGroups;

    // Calculate totals
    const totalOrders = filteredGroups.reduce((sum, g) => sum + g.orderCount, 0);
    const totalItems = filteredGroups.reduce((sum, g) => sum + g.totalItems, 0);

    return (
        <div className="relative pb-24">
            <HeaderContent
                title="Buy List"
                showSearch={true}
                searchPlaceholder="Search stores..."
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                actions={
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={fetchBuyList}
                        className="rounded-full hover:bg-secondary"
                    >
                        <RefreshCcw className="h-5 w-5 text-muted-foreground" />
                    </Button>
                }
            />

            {/* Summary Bar */}
            {!isLoading && storeGroups.length > 0 && (
                <div className="mb-4 px-4">
                    <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-2">
                            <ShoppingBasket className="h-5 w-5 text-primary" />
                            <span className="font-medium text-foreground">
                                Pending Items
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-primary font-medium">
                                {totalOrders} {totalOrders === 1 ? 'order' : 'orders'}
                            </span>
                            <span className="text-muted-foreground">
                                ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="px-4 space-y-3">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Loading buy list...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center bg-surface-light dark:bg-surface-dark rounded-lg shadow-soft border border-border/50">
                        <p className="text-destructive mb-4">{error}</p>
                        <Button onClick={fetchBuyList}>Retry</Button>
                    </div>
                ) : filteredGroups.length > 0 ? (
                    filteredGroups.map((group) => (
                        <div
                            key={group.store.id}
                            onClick={() => navigate(`/buy-list/${group.store.id}`)}
                            className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-border/50 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform hover:bg-secondary/20"
                        >
                            {/* Store Logo or Icon */}
                            <div className="h-14 w-14 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden border border-border/10">
                                {group.store.storeLogo ? (
                                    <img
                                        src={group.store.storeLogo}
                                        alt={group.store.storeName || ''}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <Store className="h-7 w-7 text-muted-foreground/50" />
                                )}
                            </div>

                            {/* Store Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg text-foreground truncate mb-1">
                                    {group.store.storeName}
                                </h3>
                                {group.store.storeAddress && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                                        <MapPin className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">{group.store.storeAddress}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex px-2 py-0.5 bg-primary/10 text-primary rounded-md text-xs font-medium">
                                        {group.orderCount} Pending Orders
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {group.totalItems} Items
                                    </span>
                                </div>
                            </div>

                            {/* Chevron */}
                            <ChevronRight className="h-5 w-5 text-muted-foreground/50 flex-shrink-0" />
                        </div>
                    ))
                ) : storeGroups.length > 0 && searchQuery ? (
                    <EmptyState
                        icon={<Search className="h-10 w-10" />}
                        title="No matches found"
                        description={`No stores match "${searchQuery}"`}
                    />
                ) : (
                    <EmptyState
                        icon={<ShoppingBasket className="h-10 w-10" />}
                        title="No pending orders"
                        description="All orders have been purchased. Great job!"
                    />
                )}
            </main>
        </div>
    );
};
