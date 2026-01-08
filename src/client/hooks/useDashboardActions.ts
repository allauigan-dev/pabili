import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import {
    Plus,
    Store,
    UserPlus,
    Receipt,
    Banknote,
    type LucideIcon
} from 'lucide-react';

export interface DashboardAction {
    id: string;
    label: string;
    icon: LucideIcon;
    path: string;
    color: string;
    bg: string;
}

export const allDashboardActions: DashboardAction[] = [
    { id: 'new-order', label: 'New Order', icon: Plus, path: '/orders/new', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/40' },
    { id: 'add-store', label: 'Add Store', icon: Store, path: '/stores/new', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/40' },
    { id: 'add-customer', label: 'Add Customer', icon: UserPlus, path: '/customers/new', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/40' },
    { id: 'create-invoice', label: 'Create Invoice', icon: Receipt, path: '/invoices/new', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/40' },
    { id: 'record-payment', label: 'Record Payment', icon: Banknote, path: '/payments/new', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/40' },
];

const defaultIds = allDashboardActions.map(a => a.id);

export function useDashboardActions() {
    // Current visible actions
    const [visibleIds, setVisibleIds] = useLocalStorage<string[]>(
        'dashboard-visible-actions-v2',
        defaultIds
    );

    // Current order of ALL actions
    const [actionOrder, setActionOrder] = useLocalStorage<string[]>(
        'dashboard-actions-order',
        defaultIds
    );

    // Get ordered list of all actions
    const allActions: DashboardAction[] = actionOrder
        .map(id => allDashboardActions.find(a => a.id === id))
        .filter((a): a is DashboardAction => !!a);

    // Handle case where new actions were added to code but not in local storage
    // (Skipping for now to avoid setting state during render, will sync on next storage access)

    const visibleActions = allActions.filter(a => visibleIds.includes(a.id));

    const toggleAction = useCallback((id: string) => {
        setVisibleIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    }, [setVisibleIds]);

    const isActionVisible = useCallback((id: string) => {
        return visibleIds.includes(id);
    }, [visibleIds]);

    const updateOrder = useCallback((newOrder: string[]) => {
        setActionOrder(newOrder);
    }, [setActionOrder]);

    const resetToDefaults = useCallback(() => {
        setVisibleIds(defaultIds);
        setActionOrder(defaultIds);
    }, [setVisibleIds, setActionOrder]);

    return {
        allActions,
        visibleActions,
        toggleAction,
        isActionVisible,
        updateOrder,
        resetToDefaults,
        visibleIds,
    };
}
