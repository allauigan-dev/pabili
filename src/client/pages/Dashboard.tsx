import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { useOrders } from '../hooks/useOrders';
import { useStores } from '../hooks/useStores';
import { useResellers } from '../hooks/useResellers';
import type { Order } from '../lib/types';
import type { BadgeProps } from '../components/Badge';

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { data: orders } = useOrders();
    const { data: stores } = useStores();
    const { data: resellers } = useResellers();

    const stats = [
        { label: 'Total Orders', value: orders?.length || 0, icon: '📦' },
        { label: 'Active Stores', value: stores?.filter(s => s.storeStatus === 'active').length || 0, icon: '🏪' },
        { label: 'Resellers', value: resellers?.length || 0, icon: '👥' },
        { label: 'Pending Orders', value: orders?.filter(o => o.orderStatus === 'pending').length || 0, icon: '⏳' },
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const recentOrders = orders?.slice(0, 5) || [];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Mabuhay! 🇵🇭</h1>
                    <p className="text-[var(--text-secondary)] mt-1">Here's what's happening with Pabili today.</p>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider">{new Date().toLocaleDateString('en-PH', { weekday: 'long' })}</p>
                    <p className="text-lg font-bold text-[var(--text-primary)]">{new Date().toLocaleDateString('en-PH', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label} className="flex flex-col items-center justify-center p-6 text-center border-b-4 border-b-[var(--primary)]">
                        <span className="text-3xl mb-2">{stat.icon}</span>
                        <span className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</span>
                        <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">{stat.label}</span>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Recent Activity" className="min-h-[300px]">
                    <div className="divide-y divide-[var(--border)]">
                        {recentOrders.length > 0 ? recentOrders.map((order: Order) => (
                            <div key={order.id} className="py-3 flex items-center justify-between hover:bg-[var(--surface-hover)] px-2 rounded-lg transition-colors cursor-pointer" onClick={() => navigate(`/orders/${order.id}/edit`)}>
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 bg-[var(--surface-hover)] rounded-lg flex items-center justify-center text-lg">
                                        {order.orderImage ? <img src={order.orderImage} className="w-full h-full object-cover rounded-lg" alt="" /> : '📦'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-[var(--text-primary)] truncate">{order.orderName}</p>
                                        <p className="text-xs text-[var(--text-muted)]">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-[var(--primary)]">{formatCurrency(order.orderResellerTotal)}</p>
                                    <Badge variant={(order.orderStatus === 'pending' ? 'warning' : 'primary') as BadgeProps['variant']} className="scale-75 origin-right">
                                        {order.orderStatus}
                                    </Badge>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center h-48 text-[var(--text-muted)]">
                                <p>No orders yet.</p>
                            </div>
                        )}
                    </div>
                </Card>
                <Card title="Quick Actions" className="min-h-[300px]">
                    <div className="grid grid-cols-2 gap-4 p-2">
                        <button onClick={() => navigate('/orders/new')} className="flex flex-col items-center p-4 rounded-xl border border-[var(--border)] hover:bg-[var(--primary-light)] hover:border-[var(--primary)] transition-all group">
                            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">➕</span>
                            <span className="text-sm font-medium">New Order</span>
                        </button>
                        <button onClick={() => navigate('/stores/new')} className="flex flex-col items-center p-4 rounded-xl border border-[var(--border)] hover:bg-[var(--primary-light)] hover:border-[var(--primary)] transition-all group">
                            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🏪</span>
                            <span className="text-sm font-medium">Add Store</span>
                        </button>
                        <button onClick={() => navigate('/resellers/new')} className="flex flex-col items-center p-4 rounded-xl border border-[var(--border)] hover:bg-[var(--primary-light)] hover:border-[var(--primary)] transition-all group">
                            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">👥</span>
                            <span className="text-sm font-medium">Add Reseller</span>
                        </button>
                        <button onClick={() => navigate('/invoices/new')} className="flex flex-col items-center p-4 rounded-xl border border-[var(--border)] hover:bg-[var(--primary-light)] hover:border-[var(--primary)] transition-all group">
                            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📄</span>
                            <span className="text-sm font-medium">Create Invoice</span>
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
};
