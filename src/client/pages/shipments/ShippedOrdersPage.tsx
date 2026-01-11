import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    RefreshCcw,
    Truck,
    Loader2,
    Search,
    Package,
    ChevronRight,
    MapPin,
    Copy,
    Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderContent } from '@/components/layout/HeaderProvider';
import { FilterPills } from '@/components/ui/FilterPills';
import { EmptyState } from '@/components/EmptyState';
import { shipmentsApi } from '@/lib/api';
import type { Shipment, ShipmentStatus } from '@/lib/types';

const statusColors: Record<ShipmentStatus, { bg: string; text: string; label: string }> = {
    preparing: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Preparing' },
    ready: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Ready' },
    in_transit: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', label: 'In Transit' },
    delivered: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Delivered' },
    cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Cancelled' },
};

export const ShippedOrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [copiedId, setCopiedId] = useState<number | null>(null);

    // Fetch counts for filter pills
    const [counts, setCounts] = useState<Record<string, number>>({ all: 0 });

    const fetchShipments = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await shipmentsApi.listPaginated(1, 100, statusFilter === 'all' ? undefined : statusFilter);
            if (response.success && response.data) {
                setShipments(response.data);
            } else {
                setError(response.error || 'Failed to load shipments');
            }
        } catch (err) {
            setError('Failed to load shipments');
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter]);

    const fetchCounts = useCallback(async () => {
        try {
            const response = await shipmentsApi.getCounts();
            if (response.success && response.data) {
                setCounts(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch counts', err);
        }
    }, []);

    useEffect(() => {
        fetchShipments();
    }, [fetchShipments]);

    useEffect(() => {
        fetchCounts();
    }, [fetchCounts]);

    const handleCopyTracking = (e: React.MouseEvent, shipment: Shipment) => {
        e.stopPropagation();
        navigator.clipboard.writeText(shipment.trackingNumber);
        setCopiedId(shipment.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleRefresh = () => {
        fetchShipments();
        fetchCounts();
    };

    // Filter by search query
    const filteredShipments = searchQuery
        ? shipments.filter(s =>
            s.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : shipments;

    const statusList = ['all', 'preparing', 'ready', 'in_transit', 'delivered', 'cancelled'];

    const filterOptions = statusList.map(s => ({
        label: s === 'all' ? 'all' : statusColors[s as ShipmentStatus]?.label || s,
        value: s,
        count: counts[s] ?? 0,
    }));

    return (
        <div className="relative pb-24">
            <HeaderContent
                title="Tracking"
                showSearch={true}
                searchPlaceholder="Search tracking # or customer..."
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                actions={
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRefresh}
                        className="rounded-full hover:bg-secondary"
                    >
                        <RefreshCcw className="h-5 w-5 text-muted-foreground" />
                    </Button>
                }
                filterContent={
                    <FilterPills
                        options={filterOptions}
                        activeValue={statusFilter}
                        onChange={setStatusFilter}
                    />
                }
            />

            {/* Summary Bar */}
            {!isLoading && shipments.length > 0 && (
                <div className="mb-4 px-4 pt-14">
                    <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-2">
                            <Truck className="h-5 w-5 text-primary" />
                            <span className="font-medium text-foreground">
                                Active Shipments
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-primary font-medium">
                                {counts.all || 0} total
                            </span>
                            <span className="text-muted-foreground">
                                ({counts.in_transit || 0} in transit)
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className={`px-4 space-y-3 ${!isLoading && shipments.length > 0 ? '' : 'pt-14'}`}>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Loading shipments...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center bg-surface-light dark:bg-surface-dark rounded-lg shadow-soft border border-border/50">
                        <p className="text-destructive mb-4">{error}</p>
                        <Button onClick={handleRefresh}>Retry</Button>
                    </div>
                ) : filteredShipments.length > 0 ? (
                    filteredShipments.map((shipment) => {
                        const statusStyle = statusColors[shipment.shipmentStatus];
                        return (
                            <div
                                key={shipment.id}
                                onClick={() => navigate(`/shipments/${shipment.id}`)}
                                className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-border/50 cursor-pointer active:scale-[0.98] transition-transform hover:bg-secondary/20"
                            >
                                {/* Top Row: Tracking & Status */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Package className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Tracking #</p>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-mono font-semibold text-sm">{shipment.trackingNumber}</span>
                                                <button
                                                    onClick={(e) => handleCopyTracking(e, shipment)}
                                                    className="p-1 rounded hover:bg-secondary/50 transition-colors"
                                                >
                                                    {copiedId === shipment.id ? (
                                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                                    ) : (
                                                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                                        {statusStyle.label}
                                    </span>
                                </div>

                                {/* Bottom Row: Customer & Details */}
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-foreground truncate">{shipment.customerName}</p>
                                        {shipment.customerAddress && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                                <span className="truncate">{shipment.customerAddress}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 ml-2">
                                        <span className="text-xs text-muted-foreground">
                                            {shipment.orderCount} {shipment.orderCount === 1 ? 'order' : 'orders'}
                                        </span>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : shipments.length > 0 && searchQuery ? (
                    <EmptyState
                        icon={<Search className="h-10 w-10" />}
                        title="No matches found"
                        description={`No shipments match "${searchQuery}"`}
                    />
                ) : (
                    <EmptyState
                        icon={<Truck className="h-10 w-10" />}
                        title="No shipments yet"
                        description="Create a shipment from packed orders to start tracking."
                        actionLabel="Go to Ship Orders"
                        onAction={() => navigate('/shipments')}
                    />
                )}
            </main>
        </div>
    );
};
