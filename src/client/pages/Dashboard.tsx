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
import { useSession } from '@/lib/auth-client';

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { data: session } = useSession();
    const { data: orders } = useOrders();
    const { data: stores } = useStores();
    const { data: resellers } = useResellers();

    // Get user's first name for greeting
    const userName = session?.user?.name?.split(' ')[0] || 'there';

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
        <div className="pb-10 px-4 sm:px-0">
            <header className="flex justify-between items-start pt-4 pb-8 transition-all">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center gap-2 tracking-tight">
                        Mabuhay! <span className="text-2xl sm:text-3xl lg:text-4xl">🇵🇭</span>
                    </h1>
                    <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mt-1">Welcome back, {userName}</p>
                </div>
                <div className="hidden sm:flex text-[10px] sm:text-xs font-bold text-muted-foreground tracking-widest uppercase bg-secondary/80 backdrop-blur-sm px-4 py-1.5 rounded-full border shadow-sm">
                    {new Date().toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
            </header>

            <section className="mb-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* Orders Card */}
                    <div className="bg-card p-4 sm:p-6 rounded-3xl shadow-sm border flex flex-col justify-between h-36 sm:h-44 relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full group-hover:scale-110 transition-transform"></div>
                        <div className="flex justify-between items-start z-10">
                            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Orders</span>
                            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
                                <Package className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                        </div>
                        <div className="z-10">
                            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">{stats.orders}</span>
                        </div>
                    </div>

                    {/* Active Stores Card */}
                    <div className="bg-card p-4 sm:p-6 rounded-3xl shadow-sm border flex flex-col justify-between h-36 sm:h-44 relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full group-hover:scale-110 transition-transform"></div>
                        <div className="flex justify-between items-start z-10">
                            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Stores</span>
                            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                                <StoreIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                        </div>
                        <div className="z-10">
                            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">{stats.activeStores}</span>
                        </div>
                    </div>

                    {/* Resellers Card */}
                    <div className="bg-card p-4 sm:p-6 rounded-3xl shadow-sm border flex flex-col justify-between h-36 sm:h-44 relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 dark:bg-purple-900/20 rounded-full group-hover:scale-110 transition-transform"></div>
                        <div className="flex justify-between items-start z-10">
                            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Resellers</span>
                            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-inner">
                                <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                        </div>
                        <div className="z-10">
                            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">{stats.resellers}</span>
                        </div>
                    </div>

                    {/* Pending Card */}
                    <div className="bg-card p-4 sm:p-6 rounded-3xl shadow-sm border flex flex-col justify-between h-36 sm:h-44 relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-full group-hover:scale-110 transition-transform"></div>
                        <div className="flex justify-between items-start z-10">
                            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Pending</span>
                            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
                                <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                        </div>
                        <div className="z-10">
                            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">{stats.pending}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Actions - Mobile & Tablet */}
            <section className="lg:hidden mb-12">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Quick Actions</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:bg-muted rounded-full"
                        onClick={() => setIsEditMode(true)}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar snap-x snap-mandatory">
                    {quickActions
                        .filter(action => visibleActionIds.includes(action.label))
                        .map((action) => (
                            <button
                                key={action.label}
                                className="snap-start shrink-0 flex flex-col items-center gap-3 group w-20 sm:w-24"
                                onClick={() => navigate(action.path)}
                            >
                                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${action.bg} ${action.color} flex items-center justify-center shadow-sm group-active:scale-95 group-hover:shadow-md transition-all`}>
                                    <action.icon className="h-7 w-7 sm:h-8 sm:w-8" />
                                </div>
                                <span className="text-[10px] sm:text-xs font-semibold text-center leading-tight text-foreground/80 group-hover:text-foreground">
                                    {action.label}
                                </span>
                            </button>
                        ))}
                    <div className="w-4 shrink-0"></div>
                </div>
            </section>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Activity Section */}
                <section className="lg:col-span-2">
                    <div className="bg-card rounded-3xl shadow-sm border p-6 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-primary/10">
                                    <History className="h-5 sm:h-6 w-5 sm:w-6 text-primary" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Recent Activity</h2>
                            </div>
                            <button
                                className="text-xs sm:text-sm font-semibold text-primary hover:underline flex items-center bg-primary/5 px-3 py-1.5 rounded-full transition-colors"
                                onClick={() => navigate('/orders')}
                            >
                                View All <ChevronRight className="h-4 w-4 ml-1" />
                            </button>
                        </div>
                        <div className="space-y-6">
                            {recentOrders.length > 0 ? recentOrders.map((order, index) => (
                                <div key={order.id}>
                                    <div
                                        className="flex items-center justify-between cursor-pointer group hover:bg-muted/50 p-2 -m-2 rounded-2xl transition-all"
                                        onClick={() => navigate(`/orders/${order.id}/edit`)}
                                    >
                                        <div className="flex items-center gap-4 sm:gap-5">
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground overflow-hidden relative shadow-sm transition-transform group-hover:scale-105">
                                                {order.orderImage ? (
                                                    <img src={order.orderImage} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="h-6 w-6 sm:h-7 sm:w-7" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-sm sm:text-base font-bold group-hover:text-primary transition-colors">{order.orderName}</h3>
                                                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                                    <span>{new Date(order.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</span>
                                                    <span className="w-1 h-1 rounded-full bg-border"></span>
                                                    <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-base sm:text-lg font-bold text-primary">{formatCurrency(order.orderResellerTotal)}</p>
                                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold mt-1.5 shadow-sm ${order.orderStatus === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                                                order.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                                                    'bg-secondary text-secondary-foreground'
                                                } capitalize`}>
                                                {order.orderStatus}
                                            </span>
                                        </div>
                                    </div>
                                    {index < recentOrders.length - 1 && (
                                        <div className="h-px bg-border/60 w-full my-1"></div>
                                    )}
                                </div>
                            )) : (
                                <div className="text-center py-16 text-muted-foreground text-sm flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                        <History className="h-6 w-6 opacity-20" />
                                    </div>
                                    <p className="italic font-medium">No recent activity found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Quick Actions Section - Desktop */}
                <section className="hidden lg:block">
                    <div className="bg-card rounded-3xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold tracking-tight">Quick Actions</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:bg-muted rounded-full"
                                onClick={() => setIsEditMode(true)}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {quickActions
                                .filter(action => visibleActionIds.includes(action.label))
                                .map((action) => (
                                    <button
                                        key={action.label}
                                        className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted transition-all border-2 border-transparent hover:border-primary/5 group text-left shadow-sm hover:shadow-md"
                                        onClick={() => navigate(action.path)}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl shrink-0 ${action.bg} ${action.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                                            <action.icon className="h-7 w-7" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                                                {action.label}
                                            </span>
                                            <span className="text-xs text-muted-foreground mt-0.5">
                                                Click to perform action
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            {quickActions.filter(action => visibleActionIds.includes(action.label)).length === 0 && (
                                <div className="text-center py-12 text-sm text-muted-foreground italic col-span-full bg-muted/20 rounded-2xl">
                                    No actions visible.
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            <Dialog open={isEditMode} onOpenChange={setIsEditMode}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Customize Actions</DialogTitle>
                        <DialogDescription>
                            Select which quick actions to display on your dashboard.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 py-4">
                        {quickActions.map((action) => (
                            <div
                                key={action.label}
                                className="flex items-center justify-between p-4 rounded-xl border-2 border-transparent bg-muted/30 hover:bg-muted/50 cursor-pointer transition-all hover:border-primary/20"
                                onClick={() => toggleAction(action.label)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${action.bg} ${action.color}`}>
                                        <action.icon className="h-5 w-5" />
                                    </div>
                                    <span className="font-bold text-base">{action.label}</span>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${visibleActionIds.includes(action.label) ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`}>
                                    {visibleActionIds.includes(action.label) && (
                                        <Check className="h-4 w-4 text-white" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
