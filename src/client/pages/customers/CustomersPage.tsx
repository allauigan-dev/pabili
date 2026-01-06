import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    RefreshCcw,
    UserPlus,
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
import { useCustomerMutations } from '@/hooks/useCustomers';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { customersApi } from '@/lib/api';
import { CustomerCard } from './CustomerCard';
import { Button } from '@/components/ui/button';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { EmptyState } from '@/components/index';
import { HeaderContent } from '@/components/layout/HeaderProvider';

export const CustomersPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        items: customers,
        isLoading,
        isLoadingMore,
        hasMore,
        error,
        sentinelRef,
        reset
    } = useInfiniteScroll({
        fetcher: customersApi.listPaginated,
        pageSize: 20,
    });
    const { deleteAction } = useCustomerMutations();
    const [searchQuery, setSearchQuery] = useState('');
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

    const filteredCustomers = useMemo(() => {
        return customers.filter(c =>
            c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.customerEmail && c.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [customers, searchQuery]);

    return (
        <div className="relative pb-24">
            <HeaderContent
                title="Customers"
                showSearch={true}
                searchPlaceholder="Search customers..."
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                actions={
                    <Button variant="ghost" size="icon" onClick={reset} className="rounded-full hover:bg-secondary">
                        <RefreshCcw className="h-5 w-5 text-muted-foreground" />
                    </Button>
                }
            />

            <main className="space-y-4 pt-6">
                {isLoading && customers.length === 0 ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 shadow-soft border border-border/50 h-32 animate-pulse" />
                        ))}
                    </div>
                ) : error && customers.length === 0 ? (
                    <div className="bg-destructive/10 text-destructive p-8 rounded-xl border border-destructive/20 text-center">
                        <p className="font-medium mb-4">{error}</p>
                        <Button variant="outline" onClick={reset}>Retry</Button>
                    </div>
                ) : filteredCustomers.length > 0 ? (
                    <div className="space-y-4">
                        {filteredCustomers.map((customer) => (
                            <CustomerCard key={customer.id} customer={customer} onDelete={handleDeleteClick} />
                        ))}

                        {/* Sentinel element for infinite scroll */}
                        <div ref={sentinelRef} className="py-4 flex justify-center">
                            {isLoadingMore && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Loading more...</span>
                                </div>
                            )}
                            {!hasMore && filteredCustomers.length > 0 && (
                                <span className="text-sm text-muted-foreground">
                                    {!searchQuery
                                        ? `All ${filteredCustomers.length} customers loaded`
                                        : `Showing ${filteredCustomers.length} of ${customers.length} customers`
                                    }
                                </span>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            className="w-full py-8 border-dashed border-2 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all mt-4 mb-8"
                            onClick={() => navigate('/customers/new')}
                        >
                            <UserPlus className="h-5 w-5 mr-2" />
                            Add New Customer
                        </Button>
                    </div>
                ) : (
                    <EmptyState
                        title={searchQuery ? "No matching customers" : "No customers found"}
                        description={searchQuery
                            ? `We couldn't find any customers matching "${searchQuery}".`
                            : "You haven't added any customers yet. Build your network by adding your first customer!"
                        }
                        actionLabel={!searchQuery ? "Add Customer" : undefined}
                        onAction={() => navigate('/customers/new')}
                    />
                )}
            </main>

            {/* Floating Action Button */}
            <FloatingActionButton
                onClick={() => navigate('/customers/new')}
                icon={<UserPlus className="h-6 w-6" />}
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Customer?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this customer? This action cannot be undone.
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
