import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    RefreshCcw,
    PlusCircle
} from 'lucide-react';
import { usePayments, usePaymentMutations } from '@/hooks/usePayments';
import { PaymentCard } from './PaymentCard';
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

export const PaymentsPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: payments, loading, error, refetch } = usePayments();
    const { deleteAction, confirmAction } = usePaymentMutations();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this payment?')) {
            await deleteAction(id);
            refetch();
        }
    };

    const handleConfirm = async (id: number) => {
        if (window.confirm('Confirm this payment?')) {
            await confirmAction(id);
            refetch();
        }
    };

    const filteredPayments = payments?.filter(p => {
        const resellerName = p.resellerName || '';
        const matchesSearch = resellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.paymentReference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.paymentAmount.toString().includes(searchQuery);
        const matchesStatus = statusFilter === 'all' ? true : p.paymentStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
                    <p className="text-muted-foreground mt-1">Track and verify payments from your resellers.</p>
                </div>
                <Button
                    onClick={() => navigate('/payments/new')}
                    className="shadow-lg hover:shadow-primary/25 transition-all w-full sm:w-auto"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Record Payment
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by reseller or reference..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setStatusFilter}>
                    <TabsList className="grid w-full grid-cols-4 md:w-[400px]">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                        <TabsTrigger value="rejected">Rejected</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-2 ml-auto">
                    <Button variant="outline" size="icon" onClick={refetch}>
                        <RefreshCcw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="p-0 overflow-hidden flex flex-col sm:flex-row h-auto sm:h-32">
                            <Skeleton className="w-full sm:w-48 h-48 sm:h-full shrink-0" />
                            <div className="p-6 flex-1 space-y-3">
                                <div className="flex justify-between">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-5 w-20 rounded-full" />
                                </div>
                                <Skeleton className="h-8 w-40" />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : error ? (
                <div className="bg-destructive/10 text-destructive p-8 rounded-xl border border-destructive/20 text-center">
                    <p className="font-medium mb-4">{error}</p>
                    <Button variant="outline" onClick={refetch}>Retry</Button>
                </div>
            ) : filteredPayments && filteredPayments.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {filteredPayments.map((payment) => (
                        <PaymentCard
                            key={payment.id}
                            payment={payment}
                            onDelete={handleDelete}
                            onConfirm={handleConfirm}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    title={searchQuery ? "No matching payments" : "No payments found"}
                    description={searchQuery
                        ? `We couldn't find any payments matching "${searchQuery}".`
                        : "You haven't recorded any payments yet. Log a payment from a reseller to track their balance!"
                    }
                    actionLabel={!searchQuery ? "Record Payment" : undefined}
                    onAction={() => navigate('/payments/new')}
                    icon={<PlusCircle className="h-10 w-10 opacity-40" />}
                />
            )}
        </div>
    );
};
