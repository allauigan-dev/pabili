import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Package,
    Store as StoreIcon,
    Users,
    Clock,
    Plus,
    UserPlus,
    History,
    Receipt,
    Pencil,
    Check,
    Banknote,
    CreditCard
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
import { useCustomers } from '@/hooks/useCustomers';

import { useActivities } from '@/hooks/useActivities';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useSession } from '@/lib/auth-client';
import { HeaderContent } from '@/components/layout/HeaderProvider';

type ActivityType = 'order' | 'customer' | 'store' | 'payment';

interface Activity {
    id: number;
    type: ActivityType;
    title: string;
    subtitle: string;
    timestamp: string;
    image?: string | null;
    status?: string;
    navigatePath: string;
    sentence: string;
}

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { data: session } = useSession();
    const { data: orders } = useOrders();
    const { data: stores } = useStores();
    const { data: customers } = useCustomers();

    const { data: activitiesData } = useActivities(10);

    // Get user's first name for greeting
    const userName = session?.user?.name?.split(' ')[0] || 'there';

    // Calculate stats
    const stats = {
        orders: orders?.length || 0,
        activeStores: stores?.filter(s => s.storeStatus === 'active').length || 0,
        customers: customers?.length || 0,
        pending: orders?.filter(o => o.orderStatus === 'pending').length || 0,
    };

    // Helper to format activity into a sentence
    const formatActivitySentence = (type: ActivityType, title: string, status: string | undefined | null, action: string | undefined | null, description: string | undefined | null): string => {
        if (type === 'order') {
            if (action === 'created') return `${title} was placed`;
            if (action === 'status_changed') {
                if (status === 'pending') return `${title} is pending`;
                if (status === 'bought') return `${title} is bought`;
                if (status === 'packed') return `${title} is packed`;
                if (status === 'delivered') return `${title} was delivered`;
                if (status === 'cancelled') return `${title} was cancelled`;
                if (status === 'no_stock') return `${title} is out of stock`;
                return `${title} is ${status}`;
            }
            if (action === 'updated') return `${title} details were updated`;
        }

        if (type === 'customer') {
            if (action === 'created') return `${title} added as new customer`;
            if (action === 'updated') return `${title} details were updated`;
        }

        if (type === 'store') {
            if (action === 'created') return `${title} added as new store`;
            if (action === 'updated') return `${title} details were updated`;
            if (action === 'status_changed') return `${title} is now ${status}`;
        }

        if (type === 'payment') {
            if (description) {
                // Capitalize first letter of description
                return description.charAt(0).toUpperCase() + description.slice(1);
            }
            return 'Payment was recorded';
        }

        // Fallback
        if (action === 'deleted') return `${title} was deleted`;
        return `${title} - ${description || ''}`;
    };

    // Map backend activities to UI Activity interface
    const recentActivities = useMemo<Activity[]>(() => {
        if (!activitiesData) return [];

        return activitiesData.map(act => {
            const type = act.type as ActivityType;
            let navigatePath = `/${type}s`;
            if (act.entityId) {
                navigatePath = `/${type}s/${act.entityId}/edit`;
            }

            return {
                id: act.id,
                type,
                title: act.title,
                subtitle: act.description || '',
                timestamp: act.createdAt,
                status: act.status || undefined,
                navigatePath,
                sentence: formatActivitySentence(type, act.title, act.status, act.action, act.description),
            };
        });
    }, [activitiesData]);

    // Get icon component for activity type
    const getActivityIcon = (type: ActivityType) => {
        switch (type) {
            case 'order': return Package;
            case 'customer': return Users;
            case 'store': return StoreIcon;
            case 'payment': return CreditCard;
        }
    };

    // Get icon background color for activity type
    const getActivityIconBg = (type: ActivityType) => {
        switch (type) {
            case 'order': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400';
            case 'customer': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400';
            case 'store': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400';
            case 'payment': return 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400';
        }
    };



    const quickActions = [
        { label: 'New Order', icon: Plus, path: '/orders/new', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/40' },
        { label: 'Add Store', icon: StoreIcon, path: '/stores/new', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/40' },
        { label: 'Add Customer', icon: UserPlus, path: '/customers/new', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/40' },
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
        <div className="pb-10">
            <HeaderContent
                title={`Mabuhay, ${userName}!`}
                actions={
                    <div className="hidden sm:flex text-[10px] font-bold text-muted-foreground tracking-widest uppercase bg-secondary/80 backdrop-blur-sm px-4 py-1.5 rounded-full border shadow-sm">
                        {new Date().toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                }
            />

            <section className="mb-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* Orders Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 sm:p-6 rounded-3xl shadow-lg border-none flex flex-col justify-between h-36 sm:h-44 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all">
                        <div className="flex justify-between items-start z-10">
                            <span className="text-[10px] sm:text-xs font-bold text-blue-100 uppercase tracking-widest">Orders</span>
                            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center shadow-inner backdrop-blur-md border border-white/10">
                                <Package className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                        </div>
                        <div className="z-10 text-white">
                            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight drop-shadow-sm">{stats.orders}</span>
                        </div>
                    </div>

                    {/* Active Stores Card */}
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 sm:p-6 rounded-3xl shadow-lg border-none flex flex-col justify-between h-36 sm:h-44 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all">
                        <div className="flex justify-between items-start z-10">
                            <span className="text-[10px] sm:text-xs font-bold text-emerald-100 uppercase tracking-widest">Active Stores</span>
                            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center shadow-inner backdrop-blur-md border border-white/10">
                                <StoreIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                        </div>
                        <div className="z-10 text-white">
                            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight drop-shadow-sm">{stats.activeStores}</span>
                        </div>
                    </div>

                    {/* Customers Card */}
                    <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-4 sm:p-6 rounded-3xl shadow-lg border-none flex flex-col justify-between h-36 sm:h-44 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all">
                        <div className="flex justify-between items-start z-10">
                            <span className="text-[10px] sm:text-xs font-bold text-purple-100 uppercase tracking-widest">Customers</span>
                            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center shadow-inner backdrop-blur-md border border-white/10">
                                <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                        </div>
                        <div className="z-10 text-white">
                            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight drop-shadow-sm">{stats.customers}</span>
                        </div>
                    </div>

                    {/* Pending Card */}
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-4 sm:p-6 rounded-3xl shadow-lg border-none flex flex-col justify-between h-36 sm:h-44 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all">
                        <div className="flex justify-between items-start z-10">
                            <span className="text-[10px] sm:text-xs font-bold text-amber-50 uppercase tracking-widest">Pending</span>
                            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center shadow-inner backdrop-blur-md border border-white/10">
                                <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                        </div>
                        <div className="z-10 text-white">
                            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight drop-shadow-sm">{stats.pending}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Actions - Mobile & Tablet */}
            <section className="lg:hidden mb-12">
                <div className="mb-6 flex items-center justify-between">
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
                        </div>
                        <div className="space-y-6">
                            {recentActivities.length > 0 ? recentActivities.map((activity, index) => {
                                const IconComponent = getActivityIcon(activity.type);
                                return (
                                    <div key={`${activity.type}-${activity.id}`}>
                                        <div
                                            className="flex items-center justify-between cursor-pointer group hover:bg-muted/50 p-2 -m-2 rounded-2xl transition-all"
                                            onClick={() => navigate(activity.navigatePath)}
                                        >
                                            <div className="flex items-center gap-4 sm:gap-5">
                                                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center overflow-hidden relative shadow-sm transition-transform group-hover:scale-105 ${activity.image ? 'bg-secondary' : getActivityIconBg(activity.type)}`}>
                                                    {activity.image ? (
                                                        <img src={activity.image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <IconComponent className="h-6 w-6 sm:h-7 sm:w-7" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-sm sm:text-base font-medium group-hover:text-primary transition-colors">{activity.sentence}</h3>
                                                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                                        <span>{new Date(activity.timestamp).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</span>
                                                        <span>{new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {index < recentActivities.length - 1 && (
                                            <div className="h-px bg-border/60 w-full my-1"></div>
                                        )}
                                    </div>
                                );
                            }) : (
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
        </div >
    );
};
