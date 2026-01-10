import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import {
    LayoutDashboard,
    ShoppingBag,
    ShoppingBasket,
    Store,
    CreditCard,
    Users,
    FileText,
    type LucideIcon
} from 'lucide-react';

export interface NavItem {
    id: string;
    label: string;
    to: string;
    icon: LucideIcon;
    required?: boolean;
}

// All available navigation items with their metadata
export const allNavItemsMap: Record<string, NavItem> = {
    dashboard: { id: 'dashboard', label: 'Dashboard', to: '/', icon: LayoutDashboard, required: true },
    orders: { id: 'orders', label: 'Orders', to: '/orders', icon: ShoppingBag },
    buyList: { id: 'buyList', label: 'Buy List', to: '/buy-list', icon: ShoppingBasket },
    stores: { id: 'stores', label: 'Stores', to: '/stores', icon: Store },
    payments: { id: 'payments', label: 'Payments', to: '/payments', icon: CreditCard },
    customers: { id: 'customers', label: 'Customers', to: '/customers', icon: Users },
    invoices: { id: 'invoices', label: 'Invoices', to: '/invoices', icon: FileText },
};

// Ordered list of all available items
export const allNavItems: NavItem[] = [
    allNavItemsMap.dashboard,
    allNavItemsMap.orders,
    allNavItemsMap.buyList,
    allNavItemsMap.stores,
    allNavItemsMap.payments,
    allNavItemsMap.customers,
    allNavItemsMap.invoices,
];

// Default enabled items (shown in bottom nav) - ordered
const defaultEnabledIds = ['dashboard', 'orders', 'buyList', 'stores'];

// Maximum items in bottom nav (including Dashboard, excluding "More" button)
const MAX_NAV_ITEMS = 4;

export function useNavConfig() {
    // Store the ordered list of enabled item IDs
    const [enabledIds, setEnabledIds] = useLocalStorage<string[]>(
        'pabili-nav-items',
        defaultEnabledIds
    );

    // Get enabled nav items in order (always includes Dashboard first)
    const enabledItems: NavItem[] = enabledIds
        .filter(id => allNavItemsMap[id])
        .map(id => allNavItemsMap[id]);

    // Ensure Dashboard is always first if not present
    if (!enabledItems.some(item => item.id === 'dashboard')) {
        enabledItems.unshift(allNavItemsMap.dashboard);
    }

    // Get items that appear in bottom nav (max 4)
    const bottomNavItems = enabledItems.slice(0, MAX_NAV_ITEMS);

    // Get items that appear in "More" menu (all items not in bottom nav)
    const moreMenuItems = allNavItems.filter(item =>
        !bottomNavItems.some(navItem => navItem.id === item.id)
    );

    // Toggle an item's visibility
    const toggleItem = useCallback((itemId: string) => {
        const item = allNavItemsMap[itemId];
        if (!item || item.required) return;

        setEnabledIds(prev => {
            if (prev.includes(itemId)) {
                // Remove item
                return prev.filter(id => id !== itemId);
            } else {
                // Add item at the end (but within max limit)
                const currentNonRequired = prev.filter(id => !allNavItemsMap[id]?.required);
                if (currentNonRequired.length >= MAX_NAV_ITEMS - 1) {
                    // At max capacity
                    return prev;
                }
                return [...prev, itemId];
            }
        });
    }, [setEnabledIds]);

    // Check if an item is enabled
    const isItemEnabled = useCallback((itemId: string) => {
        const item = allNavItemsMap[itemId];
        return item?.required || enabledIds.includes(itemId);
    }, [enabledIds]);

    // Move item up in the order
    const moveUp = useCallback((itemId: string) => {
        setEnabledIds(prev => {
            const index = prev.indexOf(itemId);
            // Can't move up if first item or Dashboard (which should always be first)
            if (index <= 1 || allNavItemsMap[itemId]?.required) return prev;

            const newOrder = [...prev];
            [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
            return newOrder;
        });
    }, [setEnabledIds]);

    // Move item down in the order
    const moveDown = useCallback((itemId: string) => {
        setEnabledIds(prev => {
            const index = prev.indexOf(itemId);
            // Can't move down if last item or Dashboard
            if (index === -1 || index >= prev.length - 1 || allNavItemsMap[itemId]?.required) return prev;

            const newOrder = [...prev];
            [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
            return newOrder;
        });
    }, [setEnabledIds]);

    // Get position of item in enabled list
    const getItemPosition = useCallback((itemId: string) => {
        return enabledIds.indexOf(itemId);
    }, [enabledIds]);

    // Reset to defaults
    const resetToDefaults = useCallback(() => {
        setEnabledIds(defaultEnabledIds);
    }, [setEnabledIds]);

    // Check if can add more items
    const canAddMore = enabledItems.filter(i => !i.required).length < MAX_NAV_ITEMS - 1;

    return {
        enabledIds,
        enabledItems,
        bottomNavItems,
        moreMenuItems,
        toggleItem,
        isItemEnabled,
        moveUp,
        moveDown,
        getItemPosition,
        resetToDefaults,
        allNavItems,
        canAddMore,
        maxItems: MAX_NAV_ITEMS,
    };
}

