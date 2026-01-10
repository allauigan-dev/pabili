import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    RefreshCcw,
    ShoppingBasket,
    Loader2,
    Search,
    User,
    ChevronRight,
    MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderContent } from '@/components/layout/HeaderProvider';
import { EmptyState } from '@/components/EmptyState';
import { ordersApi } from '@/lib/api';
import type { PackagingListGroup } from '@/lib/types';

export const PackagingPage: React.FC = () => {
    const navigate = useNavigate();
    const [customerGroups, setCustomerGroups] = useState<PackagingListGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchPackagingList = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await ordersApi.getPackagingList();
            if (response.success && response.data) {
                setCustomerGroups(response.data);
            } else {
                setError(response.error || 'Failed to load packaging list');
            }
        } catch (err) {
            setError('Failed to load packaging list');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPackagingList();
    }, [fetchPackagingList]);

    // Filter groups by search query
    const filteredGroups = searchQuery
        ? customerGroups.filter(group =>
            group.customer.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.orders.some(order =>
                order.orderName.toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
        : customerGroups;

    // Calculate totals
    const totalOrders = filteredGroups.reduce((sum, g) => sum + g.orderCount, 0);
    const totalItems = filteredGroups.reduce((sum, g) => sum + g.totalItems, 0);

    return (
        <div className="relative pb-24">
            <HeaderContent
                title="Packaging"
                showSearch={true}
                searchPlaceholder="Search customers..."
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                actions={
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={fetchPackagingList}
                        className="rounded-full hover:bg-secondary"
                    >
                        <RefreshCcw className="h-5 w-5 text-muted-foreground" />
                    </Button>
                }
            />

            {/* Summary Bar */}
            {!isLoading && customerGroups.length > 0 && (
                <div className="mb-4 px-4">
                    <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-2">
                            <ShoppingBasket className="h-5 w-5 text-primary" />
                            <span className="font-medium text-foreground">
                                Ready to Pack
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
                        <p className="text-muted-foreground">Loading packaging list...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center bg-surface-light dark:bg-surface-dark rounded-lg shadow-soft border border-border/50">
                        <p className="text-destructive mb-4">{error}</p>
                        <Button onClick={fetchPackagingList}>Retry</Button>
                    </div>
                ) : filteredGroups.length > 0 ? (
                    filteredGroups.map((group) => (
                        <div
                            key={group.customer.id}
                            onClick={() => navigate(`/packaging/${group.customer.id}`)}
                            className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-border/50 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform hover:bg-secondary/20"
                        >
                            {/* Customer Photo or Icon */}
                            <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden border border-border/10">
                                {group.customer.customerPhoto ? (
                                    <img
                                        src={group.customer.customerPhoto}
                                        alt={group.customer.customerName}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <User className="h-7 w-7 text-muted-foreground/50" />
                                )}
                            </div>

                            {/* Customer Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg text-foreground truncate mb-1">
                                    {group.customer.customerName}
                                </h3>
                                {group.customer.customerAddress && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                                        <MapPin className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">{group.customer.customerAddress}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex px-2 py-0.5 bg-primary/10 text-primary rounded-md text-xs font-medium">
                                        {group.orderCount} Orders
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
                ) : customerGroups.length > 0 && searchQuery ? (
                    <EmptyState
                        icon={<Search className="h-10 w-10" />}
                        title="No matches found"
                        description={`No customers match "${searchQuery}"`}
                    />
                ) : (
                    <EmptyState
                        icon={<ShoppingBasket className="h-10 w-10" />}
                        title="No orders to pack"
                        description="All bought orders have been packed."
                    />
                )}
            </main>
        </div>
    );
};
