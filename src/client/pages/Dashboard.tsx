import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Package,
    Store as StoreIcon,
    Users,
    Clock,
    Plus,
    UserPlus,
    History,
    ChevronRight,
    Receipt,
    Pencil,
    Check,
    Banknote
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useOrders } from '@/hooks/useOrders';
import { useStores } from '@/hooks/useStores';
import { useResellers } from '@/hooks/useResellers';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { data: orders } = useOrders();
    const { data: stores } = useStores();
    const { data: resellers } = useResellers();

    // Calculate stats
    const stats = {
        orders: orders?.length || 0,
        activeStores: stores?.filter(s => s.storeStatus === 'active').length || 0,
        resellers: resellers?.length || 0,
        pending: orders?.filter(o => o.orderStatus === 'pending').length || 0,
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const recentOrders = orders?.slice(0, 10) || [];

    const quickActions = [
        { label: 'New Order', icon: Plus, path: '/orders/new', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/40' },
        { label: 'Add Store', icon: StoreIcon, path: '/stores/new', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/40' },
        { label: 'Add Reseller', icon: UserPlus, path: '/resellers/new', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/40' },
        { label: 'Create Invoice', icon: Receipt, path: '/invoices/new', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/40' },
        { label: 'Record Payment', icon: Banknote, path: '/payments/new', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/40' },
    ];

    const [visibleActionIds, setVisibleActionIds] = useLocalStorage<string[]>(
        'dashboard-visible-actions',
        quickActions.map(a => a.label)
    );
    const [isEditMode, setIsEditMode] = React.useState(false);

    const toggleAction = (label: string) => {
        if (visibleActionIds.includes(label)) {
            setVisibleActionIds(visibleActionIds.filter(id => id !== label));
        } else {
            setVisibleActionIds([...visibleActionIds, label]);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-white transition-colors duration-200 pb-10">
            <div className="max-w-md mx-auto h-full flex flex-col">
                <header className="flex justify-between items-end px-6 pt-8 pb-6 shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            Mabuhay! <span className="text-2xl">🇵🇭</span>
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">Welcome back, Admin</p>
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                        {new Date().toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                </header>

                <section className="px-4 shrink-0">
                    <div className="grid grid-cols-2 gap-3">
                        {/* Orders Card */}
                        <div className="bg-card p-4 rounded-2xl shadow-sm border flex flex-col justify-between h-32 relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full group-hover:scale-110 transition-transform"></div>
                            <div className="flex justify-between items-start z-10">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Orders</span>
                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                    <Package className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="z-10">
                                <span className="text-3xl font-bold">{stats.orders}</span>
                            </div>
                        </div>

                        {/* Active Stores Card */}
                        <div className="bg-card p-4 rounded-2xl shadow-sm border flex flex-col justify-between h-32 relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full group-hover:scale-110 transition-transform"></div>
                            <div className="flex justify-between items-start z-10">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Stores</span>
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                    <StoreIcon className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="z-10">
                                <span className="text-3xl font-bold">{stats.activeStores}</span>
                            </div>
                        </div>

                        {/* Resellers Card */}
                        <div className="bg-card p-4 rounded-2xl shadow-sm border flex flex-col justify-between h-32 relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-purple-50 dark:bg-purple-900/20 rounded-full group-hover:scale-110 transition-transform"></div>
                            <div className="flex justify-between items-start z-10">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Resellers</span>
                                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                    <Users className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="z-10">
                                <span className="text-3xl font-bold">{stats.resellers}</span>
                            </div>
                        </div>

                        {/* Pending Card */}
                        <div className="bg-card p-4 rounded-2xl shadow-sm border flex flex-col justify-between h-32 relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full group-hover:scale-110 transition-transform"></div>
                            <div className="flex justify-between items-start z-10">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pending</span>
                                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                    <Clock className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="z-10">
                                <span className="text-3xl font-bold">{stats.pending}</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-6 shrink-0">
                    <div className="px-4 mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Quick Actions</h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            onClick={() => setIsEditMode(true)}
                        >
                            <Pencil className="h-3 w-3" />
                        </Button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto px-4 pb-2 no-scrollbar snap-x snap-mandatory">
                        {quickActions
                            .filter(action => visibleActionIds.includes(action.label))
                            .map((action) => (
                                <button
                                    key={action.label}
                                    className="snap-start shrink-0 flex flex-col items-center gap-2 group w-20 animate-in zoom-in duration-300"
                                    onClick={() => navigate(action.path)}
                                >
                                    <div className={`w-14 h-14 rounded-2xl ${action.bg} ${action.color} flex items-center justify-center shadow-sm group-hover:scale-105 group-active:scale-95 transition-all`}>
                                        <action.icon className="h-7 w-7" />
                                    </div>
                                    <span className="text-[11px] font-medium text-center leading-tight text-foreground">
                                        {action.label.split(' ').map((line, i) => (
                                            <React.Fragment key={i}>
                                                {line}{i < action.label.split(' ').length - 1 && <br />}
                                            </React.Fragment>
                                        ))}
                                    </span>
                                </button>
                            ))}
                        {quickActions.filter(action => visibleActionIds.includes(action.label)).length === 0 && (
                            <div className="flex items-center justify-center w-full py-4 text-sm text-muted-foreground italic">
                                No actions visible. Click edit to add some.
                            </div>
                        )}
                        <div className="w-1 shrink-0"></div>
                    </div>
                </section>

                <Dialog open={isEditMode} onOpenChange={setIsEditMode}>
                    <DialogContent className="sm:max-w-xs">
                        <DialogHeader>
                            <DialogTitle>Customize Actions</DialogTitle>
                            <DialogDescription>
                                Select which quick actions to display on your dashboard.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-2 py-2">
                            {quickActions.map((action) => (
                                <div
                                    key={action.label}
                                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={() => toggleAction(action.label)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-md ${action.bg} ${action.color}`}>
                                            <action.icon className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium">{action.label}</span>
                                    </div>
                                    {visibleActionIds.includes(action.label) && (
                                        <Check className="h-4 w-4 text-primary" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>

                <section className="mt-6 px-4 flex-1 min-h-0 flex flex-col">
                    <div className="bg-card rounded-2xl shadow-sm border p-5 flex flex-col h-full lg:h-auto">
                        <div className="flex items-center justify-between mb-4 shrink-0">
                            <div className="flex items-center gap-2">
                                <History className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-bold">Recent Activity</h2>
                            </div>
                            <button
                                className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center"
                                onClick={() => navigate('/orders')}
                            >
                                View All <ChevronRight className="h-4 w-4 ml-0.5" />
                            </button>
                        </div>
                        <div className="space-y-4 overflow-y-auto pr-1">
                            {recentOrders.length > 0 ? recentOrders.map((order, index) => (
                                <div key={order.id}>
                                    <div
                                        className="flex items-center justify-between cursor-pointer group"
                                        onClick={() => navigate(`/orders/${order.id}/edit`)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground overflow-hidden relative">
                                                {order.orderImage ? (
                                                    <img src={order.orderImage} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="h-5 w-5" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">{order.orderName}</h3>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-primary">{formatCurrency(order.orderResellerTotal)}</p>
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${order.orderStatus === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                                                order.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                                                    'bg-secondary text-secondary-foreground'
                                                } capitalize`}>
                                                {order.orderStatus}
                                            </span>
                                        </div>
                                    </div>
                                    {index < recentOrders.length - 1 && (
                                        <div className="h-px bg-border w-full mt-4"></div>
                                    )}
                                </div>
                            )) : (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    No recent activity
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
