import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    RefreshCcw,
    Search,
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
import { HeaderContent } from '@/components/layout/HeaderProvider';
import { FilterPills } from '@/components/ui/FilterPills';

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
            o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.storeName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const statusList = ['all', 'pending', 'bought', 'packed', 'delivered', 'cancelled', 'no_stock'];

    const filterOptions = statusList.map(f => ({
        label: f,
        value: f,
        count: orders?.filter(o => f === 'all' ? true : o.orderStatus === f).length || 0
    }));

    return (
        <div className="relative pb-24">
            <HeaderContent
                title="Orders"
                showSearch={true}
                searchPlaceholder="Search orders, customers, stores..."
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                actions={
                    <Button variant="ghost" size="icon" onClick={refetch} className="rounded-full hover:bg-secondary">
                        <RefreshCcw className="h-5 w-5 text-muted-foreground" />
                    </Button>
                }
                filterContent={
                    <FilterPills
                        options={filterOptions}
                        activeValue={filter}
                        onChange={setFilter}
                    />
                }
            />

            {/* Main Content */}
            <main className="space-y-4 pt-14">
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
                    <>
                        {filteredOrders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onDelete={handleDeleteClick}
                                onStatusChange={handleStatusChange}
                            />
                        ))}
                        <Button
                            variant="outline"
                            className="w-full py-8 border-dashed border-2 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all mt-4 mb-8"
                            onClick={() => navigate('/orders/new')}
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Add New Order
                        </Button>
                    </>
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
