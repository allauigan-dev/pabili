import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Badge, type BadgeProps } from '../../components/Badge';
import type { Order } from '../../lib/types';

interface OrderCardProps {
    order: Order;
    onDelete?: (id: number) => void;
}

const statusVariants: Record<Order['orderStatus'], BadgeProps['variant']> = {
    pending: 'warning',
    bought: 'primary',
    packed: 'secondary',
    delivered: 'success',
    cancelled: 'error',
    no_stock: 'neutral',
};

export const OrderCard: React.FC<OrderCardProps> = ({ order, onDelete }) => {
    const navigate = useNavigate();

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete && window.confirm('Are you sure you want to delete this order?')) {
            onDelete(order.id);
        }
    };
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    return (
        <Card
            className="hover:scale-[1.01] transition-transform group relative"
            onClick={() => navigate(`/orders/${order.id}/edit`)}
        >
            {onDelete && (
                <button
                    onClick={handleDelete}
                    className="absolute top-2 right-2 p-1.5 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 rounded-full z-10"
                    title="Delete Order"
                >
                    🗑️
                </button>
            )}
            <div className="flex gap-4">
                <div className="w-20 h-20 bg-[var(--surface-hover)] rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {order.orderImage ? (
                        <img src={order.orderImage} alt={order.orderName} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-2xl">📦</span>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <Badge variant={statusVariants[order.orderStatus]}>
                            {order.orderStatus.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-[var(--text-muted)] font-mono">{order.orderNumber}</span>
                    </div>

                    <h4 className="font-bold text-[var(--text-primary)] truncate">{order.orderName}</h4>
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-1">{order.orderDescription || 'No description'}</p>

                    <div className="mt-3 flex items-center justify-between">
                        <div className="text-sm">
                            <span className="text-[var(--text-muted)]">Qty: </span>
                            <span className="font-semibold">{order.orderQuantity}</span>
                        </div>
                        <div className="text-md font-bold text-[var(--primary)]">
                            {formatCurrency(order.orderResellerTotal)}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};
