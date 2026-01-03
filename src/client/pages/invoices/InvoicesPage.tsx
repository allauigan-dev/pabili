import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    RefreshCcw,
    Receipt
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
import { useInvoices, useInvoiceMutations } from '@/hooks/useInvoices';
import { InvoiceCard } from './InvoiceCard';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/index';

export const InvoicesPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: invoices, loading, error, refetch } = useInvoices();
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
            refetch();
        }
    };

    const filteredInvoices = invoices?.filter(i => {
        const resellerName = i.resellerName || '';
        const matchesSearch = i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resellerName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' ? true : i.invoiceStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statusList = ['all', 'draft', 'pending', 'sent', 'paid', 'overdue', 'cancelled'];

    return (
        <div className="relative pb-24 min-h-screen -mx-2 -my-1 px-4 pt-2 md:mx-0 md:my-0 md:px-0">
            {/* Sticky Header */}
            <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm -mx-4 px-4 pt-4 pb-2 md:mx-0 md:px-0 transition-all">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Invoices</h1>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={refetch} className="rounded-full hover:bg-secondary">
                            <RefreshCcw className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                        className="block w-full pl-10 pr-3 h-12 border-none rounded-xl bg-surface-light dark:bg-surface-dark shadow-sm ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm transition-shadow text-foreground placeholder:text-muted-foreground"
                        placeholder="Search invoices, resellers..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2 mask-linear">
                    {statusList.map((f) => {
                        const count = invoices?.filter(i => f === 'all' ? true : i.invoiceStatus === f).length || 0;
                        const isActive = statusFilter === f;

                        return (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${isActive
                                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                                    : 'bg-surface-light dark:bg-surface-dark text-muted-foreground border border-border hover:bg-secondary'
                                    }`}
                            >
                                <span className="capitalize">{f}</span>
                                {isActive && (
                                    <span className="bg-white/20 text-current text-[10px] px-1.5 py-0.5 rounded-full">
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </header>

            {/* Main Content */}
            <main className="space-y-4 pt-2">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 shadow-soft border border-border/50 h-32 animate-pulse" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="p-8 text-center bg-surface-light dark:bg-surface-dark rounded-2xl shadow-soft border border-border/50">
                        <p className="text-destructive mb-4">{error}</p>
                        <Button onClick={refetch}>Retry</Button>
                    </div>
                ) : filteredInvoices && filteredInvoices.length > 0 ? (
                    filteredInvoices.map((invoice) => (
                        <InvoiceCard
                            key={invoice.id}
                            invoice={invoice}
                            onDelete={handleDeleteClick}
                        />
                    ))
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
            <div className="fixed bottom-24 right-4 z-40">
                <Button
                    onClick={() => navigate('/invoices/new')}
                    className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-fab hover:bg-primary-dark transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                >
                    <Plus className="h-8 w-8" />
                </Button>
            </div>

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
