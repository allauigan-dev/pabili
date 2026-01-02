import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayments, usePaymentMutations } from '../../hooks/usePayments';
import { PaymentCard } from './PaymentCard';
import { Button, Spinner, EmptyState } from '../../components';

export const PaymentsPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: payments, loading, error, refetch } = usePayments();
    const { deleteAction, confirmAction } = usePaymentMutations();

    const handleDelete = async (id: number) => {
        await deleteAction(id);
        refetch();
    };

    const handleConfirm = async (id: number) => {
        await confirmAction(id);
        refetch();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Payments</h1>
                <Button
                    variant="primary"
                    icon={<span className="text-xl">+</span>}
                    onClick={() => navigate('/payments/new')}
                >
                    Record Payment
                </Button>
            </div>

            {loading ? (
                <Spinner className="py-20" />
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex justify-between items-center">
                    <span>{error}</span>
                    <Button size="sm" variant="ghost" onClick={refetch}>Retry</Button>
                </div>
            ) : payments && payments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {payments.map((payment) => (
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
                    title="No payments recorded"
                    description="When resellers pay for their orders, record them here to keep track of their balance."
                    actionLabel="Record Payment"
                    onAction={() => navigate('/payments/new')}
                    icon="💰"
                />
            )}
        </div>
    );
};
