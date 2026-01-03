import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    RefreshCcw,
} from 'lucide-react';
import { useOrders, useOrderMutations } from '@/hooks/useOrders';
import { OrderCard } from './OrderCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/index';
import { Badge } from '@/components/ui/badge';
// Dropdown menu components removed as they were unused
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export const OrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: orders, loading, error, refetch } = useOrders();
    const { deleteAction } = useOrderMutations();
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            await deleteAction(id);
            refetch();
        }
    };

    const filteredOrders = orders?.filter(o => {
        const matchesFilter = filter === 'all' ? true : o.orderStatus === filter;
        const matchesSearch = o.orderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.resellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.storeName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const statusList = ['all', 'pending', 'bought', 'packed', 'delivered'];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                    <p className="text-muted-foreground mt-1">Manage and track your pasabuy orders.</p>
                </div>
                <Button
                    onClick={() => navigate('/orders/new')}
                    className="shadow-lg hover:shadow-primary/25 transition-all w-full sm:w-auto"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Order
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search orders, resellers, stores..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full no-scrollbar">
                    {statusList.map((f) => (
                        <Button
                            key={f}
                            variant={filter === f ? 'default' : 'secondary'}
                            size="sm"
                            onClick={() => setFilter(f)}
                            className="capitalize shrink-0 h-9"
                        >
                            {f}
                            {filter === f && orders && (
                                <Badge variant="secondary" className="ml-2 h-5 min-w-[20px] px-1 bg-background/20">
                                    {orders.filter(o => f === 'all' ? true : o.orderStatus === f).length}
                                </Badge>
                            )}
                        </Button>
                    ))}
                    <div className="ml-auto flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={refetch} className="shrink-0">
                            <RefreshCcw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="h-48 w-full rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardContent className="flex flex-col items-center justify-center py-10 gap-4">
                        <p className="text-destructive font-medium">{error}</p>
                        <Button variant="outline" onClick={refetch}>Retry</Button>
                    </CardContent>
                </Card>
            ) : filteredOrders && filteredOrders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrders.map((order) => (
                        <OrderCard key={order.id} order={order} onDelete={handleDelete} />
                    ))}
                </div>
            ) : (
                <EmptyState
                    title={searchQuery ? "No matching orders" : "No orders found"}
                    description={searchQuery
                        ? `We couldn't find any orders matching "${searchQuery}".`
                        : filter === 'all'
                            ? "You haven't created any orders yet. Start by adding your first order!"
                            : `No orders match the "${filter}" status.`
                    }
                    actionLabel={!searchQuery && filter === 'all' ? "Create Order" : undefined}
                    onAction={() => navigate('/orders/new')}
                />
            )}
        </div>
    );
};
