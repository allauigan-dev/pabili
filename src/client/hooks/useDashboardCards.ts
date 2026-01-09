import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import {
    Package,
    Store,
    Users,
    Clock,
    Receipt,
    Banknote,
    TrendingUp,
    AlertCircle,
    type LucideIcon
} from 'lucide-react';

export interface DashboardCard {
    id: string;
    label: string;
    icon: LucideIcon;
    statKey: string; // Key in DashboardStats response
    gradient: string; // Tailwind gradient classes
    textColor: string; // Text color for the card
    iconBg: string; // Icon background
}

export const allDashboardCards: DashboardCard[] = [
    {
        id: 'orders',
        label: 'Orders',
        icon: Package,
        statKey: 'orders',
        gradient: 'from-blue-600 to-blue-700',
        textColor: 'text-blue-100',
        iconBg: 'bg-white/20',
    },
    {
        id: 'active-stores',
        label: 'Active Stores',
        icon: Store,
        statKey: 'activeStores',
        gradient: 'from-emerald-500 to-emerald-600',
        textColor: 'text-emerald-100',
        iconBg: 'bg-white/20',
    },
    {
        id: 'customers',
        label: 'Customers',
        icon: Users,
        statKey: 'customers',
        gradient: 'from-purple-600 to-purple-700',
        textColor: 'text-purple-100',
        iconBg: 'bg-white/20',
    },
    {
        id: 'pending',
        label: 'Pending',
        icon: Clock,
        statKey: 'pending',
        gradient: 'from-amber-500 to-amber-600',
        textColor: 'text-amber-50',
        iconBg: 'bg-white/20',
    },
    {
        id: 'invoices',
        label: 'Invoices',
        icon: Receipt,
        statKey: 'invoices',
        gradient: 'from-cyan-500 to-cyan-600',
        textColor: 'text-cyan-50',
        iconBg: 'bg-white/20',
    },
    {
        id: 'overdue-invoices',
        label: 'Overdue',
        icon: AlertCircle,
        statKey: 'overdueInvoices',
        gradient: 'from-red-500 to-red-600',
        textColor: 'text-red-50',
        iconBg: 'bg-white/20',
    },
    {
        id: 'payments',
        label: 'Payments',
        icon: Banknote,
        statKey: 'payments',
        gradient: 'from-rose-500 to-rose-600',
        textColor: 'text-rose-50',
        iconBg: 'bg-white/20',
    },
    {
        id: 'revenue',
        label: 'Revenue',
        icon: TrendingUp,
        statKey: 'revenue',
        gradient: 'from-indigo-500 to-indigo-600',
        textColor: 'text-indigo-50',
        iconBg: 'bg-white/20',
    },
];

// Default visible cards (first 4)
const defaultIds = ['orders', 'active-stores', 'customers', 'pending'];

export function useDashboardCards() {
    // Visible card IDs
    const [visibleIds, setVisibleIds] = useLocalStorage<string[]>(
        'dashboard-visible-cards-v1',
        defaultIds
    );

    // Order of ALL cards
    const [cardOrder, setCardOrder] = useLocalStorage<string[]>(
        'dashboard-cards-order-v1',
        allDashboardCards.map(c => c.id)
    );

    // Get ordered list of all cards
    const allCards: DashboardCard[] = cardOrder
        .map(id => allDashboardCards.find(c => c.id === id))
        .filter((c): c is DashboardCard => !!c);

    // Add any new cards that might have been added to code but not in storage
    const missingCards = allDashboardCards.filter(
        c => !cardOrder.includes(c.id)
    );
    if (missingCards.length > 0) {
        const newOrder = [...cardOrder, ...missingCards.map(c => c.id)];
        setCardOrder(newOrder);
    }

    // Visible cards in order
    const visibleCards = allCards.filter(c => visibleIds.includes(c.id));

    const toggleCard = useCallback((id: string) => {
        setVisibleIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    }, [setVisibleIds]);

    const isCardVisible = useCallback((id: string) => {
        return visibleIds.includes(id);
    }, [visibleIds]);

    const updateOrder = useCallback((newOrder: string[]) => {
        setCardOrder(newOrder);
    }, [setCardOrder]);

    const resetToDefaults = useCallback(() => {
        setVisibleIds(defaultIds);
        setCardOrder(allDashboardCards.map(c => c.id));
    }, [setVisibleIds, setCardOrder]);

    return {
        allCards,
        visibleCards,
        toggleCard,
        isCardVisible,
        updateOrder,
        resetToDefaults,
        visibleIds,
    };
}
