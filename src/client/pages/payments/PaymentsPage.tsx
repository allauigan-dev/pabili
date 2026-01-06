import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    RefreshCcw,
    PlusCircle,
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
import { usePaymentMutations } from '@/hooks/usePayments';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { paymentsApi } from '@/lib/api';
import { PaymentCard } from './PaymentCard';
import { Button } from '@/components/ui/button';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { EmptyState } from '@/components/index';
import { HeaderContent } from '@/components/layout/HeaderProvider';
import { FilterPills } from '@/components/ui/FilterPills';

export const PaymentsPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        items: payments,
        isLoading,
        isLoadingMore,
        hasMore,
        error,
        sentinelRef,
        reset
    } = useInfiniteScroll({
        fetcher: paymentsApi.listPaginated,
        pageSize: 20,
    });
    const { deleteAction, confirmAction } = usePaymentMutations();
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

    const handleConfirm = async (id: number) => {
        if (window.confirm('Confirm this payment?')) {
            await confirmAction(id);
            reset();
        }
    };

    const filteredPayments = useMemo(() => {
        return payments.filter(p => {
            const customerName = p.customerName || '';
            const matchesSearch = customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.paymentReference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.paymentAmount.toString().includes(searchQuery);
            const matchesStatus = statusFilter === 'all' ? true : p.paymentStatus === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [payments, searchQuery, statusFilter]);

    const statusList = ['all', 'pending', 'confirmed', 'rejected'];

    const filterOptions = useMemo(() => {
        return statusList.map(f => ({
            label: f,
            value: f,
            count: payments.filter(p => f === 'all' ? true : p.paymentStatus === f).length
        }));
    }, [payments]);

    return (
        <div className="relative pb-24">
            <HeaderContent
                title="Payments"
                showSearch={true}
                searchPlaceholder="Search payments, reference..."
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
                {isLoading && payments.length === 0 ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 shadow-soft border border-border/50 h-32 animate-pulse" />
                        ))}
                    </div>
                ) : error && payments.length === 0 ? (
                    <div className="p-8 text-center bg-surface-light dark:bg-surface-dark rounded-2xl shadow-soft border border-border/50">
                        <p className="text-destructive mb-4">{error}</p>
                        <Button onClick={reset}>Retry</Button>
                    </div>
                ) : filteredPayments.length > 0 ? (
                    <div className="space-y-4">
                        {filteredPayments.map((payment) => (
                            <PaymentCard
                                key={payment.id}
                                payment={payment}
                                onDelete={handleDeleteClick}
                                onConfirm={handleConfirm}
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
                            {!hasMore && payments.length > 0 && (
                                <span className="text-sm text-muted-foreground">
                                    All {payments.length} payments loaded
                                </span>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            className="w-full py-8 border-dashed border-2 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all mt-4 mb-8"
                            onClick={() => navigate('/payments/new')}
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Record Payment
                        </Button>
                    </div>
                ) : (
                    <EmptyState
                        title={searchQuery ? "No matching payments" : "No payments found"}
                        description={searchQuery
                            ? `We couldn't find any payments matching "${searchQuery}".`
                            : "You haven't recorded any payments yet."
                        }
                        actionLabel={!searchQuery ? "Record Payment" : undefined}
                        onAction={() => navigate('/payments/new')}
                        icon={<PlusCircle className="h-10 w-10 opacity-40" />}
                    />
                )}
            </main>

            {/* Floating Action Button */}
            <FloatingActionButton
                onClick={() => navigate('/payments/new')}
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Payment?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this payment? This action cannot be undone.
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
