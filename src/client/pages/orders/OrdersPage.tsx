import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders, useOrderMutations } from '../../hooks/useOrders';
import { OrderCard } from './OrderCard';
import { Button, Spinner, EmptyState } from '../../components';

export const OrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: orders, loading, error, refetch } = useOrders();
    const { deleteAction } = useOrderMutations();
    const [filter, setFilter] = useState('all');

    const handleDelete = async (id: number) => {
        await deleteAction(id);
        refetch();
    };

    const filteredOrders = orders?.filter(o =>
        filter === 'all' ? true : o.orderStatus === filter
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold">Orders</h1>
                <Button
                    variant="primary"
                    icon={<span className="text-xl">+</span>}
                    onClick={() => navigate('/orders/new')}
                >
                    New Order
                </Button>
            </div>

            <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
                {['all', 'pending', 'bought', 'packed', 'delivered'].map((f) => (
                    <Button
                        key={f}
                        variant={filter === f ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setFilter(f)}
                        className="capitalize"
                    >
                        {f}
                    </Button>
                ))}
            </div>

            {loading ? (
                <Spinner />
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex justify-between items-center">
                    <span>{error}</span>
                    <Button size="sm" variant="ghost" onClick={refetch}>Retry</Button>
                </div>
            ) : filteredOrders && filteredOrders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredOrders.map((order) => (
                        <OrderCard key={order.id} order={order} onDelete={handleDelete} />
                    ))}
                </div>
            ) : (
                <EmptyState
                    title="No orders found"
                    description={filter === 'all'
                        ? "You haven't created any orders yet. Start by adding your first order!"
                        : `No orders match the "${filter}" status.`
                    }
                    actionLabel={filter === 'all' ? "Create Order" : undefined}
                    onAction={() => navigate('/orders/new')}
                />
            )}
        </div>
    );
};
