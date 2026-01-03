import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Package,
    Store as StoreIcon,
    Users,
    Clock,
    Plus,
    ChevronRight,
    TrendingUp,
    History,
    FileText
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOrders } from '@/hooks/useOrders';
import { useStores } from '@/hooks/useStores';
import { useResellers } from '@/hooks/useResellers';
import type { Order } from '@/lib/types';

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { data: orders } = useOrders();
    const { data: stores } = useStores();
    const { data: resellers } = useResellers();

    const stats = [
        {
            label: 'Total Orders',
            value: orders?.length || 0,
            icon: Package,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            label: 'Active Stores',
            value: stores?.filter(s => s.storeStatus === 'active').length || 0,
            icon: StoreIcon,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10'
        },
        {
            label: 'Resellers',
            value: resellers?.length || 0,
            icon: Users,
            color: 'text-violet-500',
            bg: 'bg-violet-500/10'
        },
        {
            label: 'Pending Orders',
            value: orders?.filter(o => o.orderStatus === 'pending').length || 0,
            icon: Clock,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10'
        },
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const recentOrders = orders?.slice(0, 5) || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mabuhay! 🇵🇭</h1>
                    <p className="text-muted-foreground mt-1">Here's what's happening with Pabili today.</p>
                </div>
                <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                        {new Date().toLocaleDateString('en-PH', { weekday: 'long' })}
                    </p>
                    <p className="text-lg font-bold">
                        {new Date().toLocaleDateString('en-PH', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.label} className="overflow-hidden border-none shadow-md bg-gradient-to-br from-card to-secondary/30">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.bg}`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-0.5">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <History className="h-5 w-5 text-primary" />
                                Recent Activity
                            </CardTitle>
                            <CardDescription>Latest orders from your resellers</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
                            View All
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            {recentOrders.length > 0 ? recentOrders.map((order: Order) => (
                                <div
                                    key={order.id}
                                    className="group flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-secondary/50 cursor-pointer"
                                    onClick={() => navigate(`/orders/${order.id}/edit`)}
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden shrink-0 border group-hover:border-primary/50 transition-colors">
                                            {order.orderImage ? (
                                                <img src={order.orderImage} className="h-full w-full object-cover" alt="" />
                                            ) : (
                                                <Package className="h-6 w-6 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold truncate">{order.orderName}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 ml-4">
                                        <p className="text-sm font-bold text-primary">{formatCurrency(order.orderResellerTotal)}</p>
                                        <Badge variant={order.orderStatus === 'pending' ? 'outline' : 'default'} className="mt-1 capitalize text-[10px] h-5 px-1.5">
                                            {order.orderStatus}
                                        </Badge>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center">
                                    <Clock className="h-12 w-12 mb-2 opacity-20" />
                                    <p>No orders yet.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Quick Actions
                        </CardTitle>
                        <CardDescription>Shortcut to common tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-3">
                        <Button
                            variant="outline"
                            className="justify-start h-auto py-4 px-4 gap-4 hover:border-primary hover:bg-primary/5 group"
                            onClick={() => navigate('/orders/new')}
                        >
                            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                <Plus className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold">New Order</p>
                                <p className="text-xs text-muted-foreground">Add a pasabuy request</p>
                            </div>
                        </Button>
                        <Button
                            variant="outline"
                            className="justify-start h-auto py-4 px-4 gap-4 hover:border-primary hover:bg-primary/5 group"
                            onClick={() => navigate('/stores/new')}
                        >
                            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                <StoreIcon className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold">Add Store</p>
                                <p className="text-xs text-muted-foreground">Add a new shopping location</p>
                            </div>
                        </Button>
                        <Button
                            variant="outline"
                            className="justify-start h-auto py-4 px-4 gap-4 hover:border-primary hover:bg-primary/5 group"
                            onClick={() => navigate('/resellers/new')}
                        >
                            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                <Users className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold">Add Reseller</p>
                                <p className="text-xs text-muted-foreground">Register a new partner</p>
                            </div>
                        </Button>
                        <Button
                            variant="outline"
                            className="justify-start h-auto py-4 px-4 gap-4 hover:border-primary hover:bg-primary/5 group"
                            onClick={() => navigate('/invoices/new')}
                        >
                            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold">Create Invoice</p>
                                <p className="text-xs text-muted-foreground">Generate billing for items</p>
                            </div>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
