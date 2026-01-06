import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    RefreshCcw,
    Receipt,
    Plus,
    Loader2,
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useInvoiceMutations } from '@/hooks/useInvoices';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { invoicesApi } from '@/lib/api';
import { InvoiceCard } from './InvoiceCard';
import { Button } from '@/components/ui/button';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { EmptyState } from '@/components/index';
import { HeaderContent } from '@/components/layout/HeaderProvider';
import { FilterPills } from '@/components/ui/FilterPills';

export const InvoicesPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        items: invoices,
        isLoading,
        isLoadingMore,
        hasMore,
        error,
        sentinelRef,
        reset
    } = useInfiniteScroll({
        fetcher: invoicesApi.listPaginated,
        pageSize: 20,
    });
    const { deleteAction } = useInvoiceMutations();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (deleteId) {
            await deleteAction(deleteId);
            setDeleteId(null);
            reset();
        }
    };

    const filteredInvoices = useMemo(() => {
        return invoices.filter(i => {
            const customerName = i.customerName || '';
            const matchesSearch = i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                customerName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' ? true : i.invoiceStatus === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [invoices, searchQuery, statusFilter]);

    const statusList = ['all', 'draft', 'pending', 'sent', 'paid', 'overdue', 'cancelled'];

    const filterOptions = useMemo(() => {
        return statusList.map(f => ({
            label: f,
            value: f,
            count: invoices.filter(i => f === 'all' ? true : i.invoiceStatus === f).length
        }));
    }, [invoices]);

    return (
        <div className="relative pb-24">
            <HeaderContent
                title="Invoices"
                showSearch={true}
                searchPlaceholder="Search invoices, customers..."
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                actions={
                    <Button variant="ghost" size="icon" onClick={reset} className="rounded-full hover:bg-secondary">
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

            {/* Main Content */}
            <main className="space-y-4 pt-14">
                {isLoading && invoices.length === 0 ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 shadow-soft border border-border/50 h-32 animate-pulse" />
                        ))}
                    </div>
                ) : error && invoices.length === 0 ? (
                    <div className="p-8 text-center bg-surface-light dark:bg-surface-dark rounded-2xl shadow-soft border border-border/50">
                        <p className="text-destructive mb-4">{error}</p>
                        <Button onClick={reset}>Retry</Button>
                    </div>
                ) : filteredInvoices.length > 0 ? (
                    <div className="space-y-4">
                        {filteredInvoices.map((invoice) => (
                            <InvoiceCard
                                key={invoice.id}
                                invoice={invoice}
                                onDelete={handleDeleteClick}
                            />
                        ))}

                        {/* Sentinel element for infinite scroll */}
                        <div ref={sentinelRef} className="py-4 flex justify-center">
                            {isLoadingMore && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Loading more...</span>
                                </div>
                            )}
                            {!hasMore && filteredInvoices.length > 0 && (
                                <span className="text-sm text-muted-foreground">
                                    {statusFilter === 'all' && !searchQuery
                                        ? `All ${filteredInvoices.length} invoices loaded`
                                        : `Showing ${filteredInvoices.length} of ${invoices.length} invoices`
                                    }
                                </span>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            className="w-full py-8 border-dashed border-2 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all mt-4 mb-8"
                            onClick={() => navigate('/invoices/new')}
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Generate Invoice
                        </Button>
                    </div>
                ) : (
                    <EmptyState
                        title={searchQuery ? "No matching invoices" : "No invoices found"}
                        description={searchQuery
                            ? `We couldn't find any invoices matching "${searchQuery}".`
                            : "You haven't generated any invoices yet."
                        }
                        actionLabel={!searchQuery ? "Generate Invoice" : undefined}
                        onAction={() => navigate('/invoices/new')}
                        icon={<Receipt className="h-10 w-10 opacity-40" />}
                    />
                )}
            </main>

            {/* Floating Action Button */}
            <FloatingActionButton
                onClick={() => navigate('/invoices/new')}
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this invoice? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
