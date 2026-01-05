
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Bell,
    RefreshCcw,
} from 'lucide-react';
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
import { useOrders, useOrderMutations } from '@/hooks/useOrders';
import { OrderCard } from './OrderCard';
import { Button } from '@/components/ui/button';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import type { OrderStatus } from '@/lib/types';


export const OrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: orders, loading, error, refetch } = useOrders();
    const { deleteAction, updateStatusAction } = useOrderMutations();
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (deleteId) {
            await deleteAction(deleteId);
            setDeleteId(null);
            refetch();
        }
    };

    const handleStatusChange = async (id: number, status: OrderStatus) => {
        await updateStatusAction({ id, status });
        refetch();
    };

    const filteredOrders = orders?.filter(o => {
        const matchesFilter = filter === 'all' ? true : o.orderStatus === filter;
        const matchesSearch = o.orderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.resellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.storeName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const statusList = ['all', 'pending', 'bought', 'packed', 'delivered', 'cancelled', 'no_stock'];

    return (
        <div className="relative pb-24 min-h-screen px-4">
            {/* Sticky Header */}
            <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm -mx-4 px-4 pt-4 pb-2 transition-all">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Orders</h1>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={refetch} className="rounded-full hover:bg-secondary">
                            <RefreshCcw className="h-5 w-5 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary">
                            <Bell className="h-6 w-6 text-muted-foreground" />
                        </Button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                        className="block w-full pl-10 pr-3 h-12 border-none rounded-xl bg-surface-light dark:bg-surface-dark shadow-sm ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm transition-shadow text-foreground placeholder:text-muted-foreground"
                        placeholder="Search orders, resellers, stores..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2 mask-linear">
                    {statusList.map((f) => {
                        const count = orders?.filter(o => f === 'all' ? true : o.orderStatus === f).length || 0;
                        const isActive = filter === f;

                        return (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${isActive
                                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                                    : 'bg-surface-light dark:bg-surface-dark text-muted-foreground border border-border hover:bg-secondary'
                                    }`}
                            >
                                <span className="capitalize">{f}</span>
                                {isActive && (
                                    <span className="bg-white/20 text-current text-[10px] px-1.5 py-0.5 rounded-full">
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </header>

            {/* Main Content */}
            <main className="space-y-4 pt-2">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 shadow-soft border border-border/50 h-32 animate-pulse" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="p-8 text-center bg-surface-light dark:bg-surface-dark rounded-2xl shadow-soft border border-border/50">
                        <p className="text-destructive mb-4">{error}</p>
                        <Button onClick={refetch}>Retry</Button>
                    </div>
                ) : filteredOrders && filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onDelete={handleDeleteClick}
                            onStatusChange={handleStatusChange}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 opacity-60">
                        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
                            <Search className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-medium">No orders found</p>
                    </div>
                )}
            </main>

            {/* Floating Action Button */}
            <FloatingActionButton
                onClick={() => navigate('/orders/new')}
                icon={<Plus className="h-8 w-8" />}
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the order.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
