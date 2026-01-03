import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    RefreshCcw,
    Receipt
} from 'lucide-react';
import { useInvoices, useInvoiceMutations } from '@/hooks/useInvoices';
import { InvoiceCard } from './InvoiceCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/index';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import {
    Tabs,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';

export const InvoicesPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: invoices, loading, error, refetch } = useInvoices();
    const { deleteAction } = useInvoiceMutations();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            await deleteAction(id);
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

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                    <p className="text-muted-foreground mt-1">Manage and generate billing for your resellers.</p>
                </div>
                <Button
                    onClick={() => navigate('/invoices/new')}
                    className="shadow-lg hover:shadow-primary/25 transition-all w-full sm:w-auto"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Invoice
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by invoice # or reseller..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setStatusFilter}>
                    <TabsList className="grid w-full grid-cols-4 md:w-[450px]">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="paid">Paid</TabsTrigger>
                        <TabsTrigger value="overdue">Overdue</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-2 ml-auto">
                    <Button variant="outline" size="icon" onClick={refetch}>
                        <RefreshCcw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <Card key={i} className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-48" />
                                </div>
                            </div>
                            <Skeleton className="h-20 w-full rounded-xl" />
                            <div className="flex justify-between">
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-8 w-32" />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : error ? (
                <div className="bg-destructive/10 text-destructive p-8 rounded-xl border border-destructive/20 text-center">
                    <p className="font-medium mb-4">{error}</p>
                    <Button variant="outline" onClick={refetch}>Retry</Button>
                </div>
            ) : filteredInvoices && filteredInvoices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredInvoices.map((invoice) => (
                        <InvoiceCard
                            key={invoice.id}
                            invoice={invoice}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    title={searchQuery ? "No matching invoices" : "No invoices found"}
                    description={searchQuery
                        ? `We couldn't find any invoices matching "${searchQuery}".`
                        : "You haven't generated any invoices yet. Batch some orders and bill a reseller to get started!"
                    }
                    actionLabel={!searchQuery ? "Generate Invoice" : undefined}
                    onAction={() => navigate('/invoices/new')}
                    icon={<Receipt className="h-10 w-10 opacity-40" />}
                />
            )}
        </div>
    );
};
