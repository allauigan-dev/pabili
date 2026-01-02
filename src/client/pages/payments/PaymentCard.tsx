import React from 'react';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import type { Payment } from '../../lib/types';

interface PaymentCardProps {
    payment: Payment;
    onDelete?: (id: number) => void;
    onConfirm?: (id: number) => void;
}

const methodIcons: Record<string, string> = {
    cash: '💵',
    gcash: '🔵',
    paymaya: '🟢',
    bank_transfer: '🏦',
    other: '💳',
};

export const PaymentCard: React.FC<PaymentCardProps> = ({ payment, onDelete, onConfirm }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete && window.confirm('Are you sure you want to delete this payment record?')) {
            onDelete(payment.id);
        }
    };

    const handleConfirm = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onConfirm) {
            onConfirm(payment.id);
        }
    };

    return (
        <Card className="hover:shadow-md transition-shadow group relative">
            {onDelete && (
                <button
                    onClick={handleDelete}
                    className="absolute top-2 right-2 p-1.5 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 rounded-full z-10"
                    title="Delete Payment"
                >
                    🗑️
                </button>
            )}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="text-2xl w-10 h-10 bg-[var(--surface-hover)] rounded-full flex items-center justify-center">
                        {methodIcons[payment.paymentMethod] || '💰'}
                    </div>
                    <div>
                        <h4 className="font-bold text-[var(--text-primary)]">
                            {formatCurrency(payment.paymentAmount)}
                        </h4>
                        <p className="text-xs text-[var(--text-muted)]">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <Badge variant={payment.paymentStatus === 'confirmed' ? 'success' : payment.paymentStatus === 'pending' ? 'warning' : 'error'}>
                    {payment.paymentStatus}
                </Badge>
                {payment.paymentStatus === 'pending' && onConfirm && (
                    <button
                        onClick={handleConfirm}
                        className="ml-2 text-xs text-[var(--primary)] hover:underline"
                    >
                        Confirm
                    </button>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Method:</span>
                    <span className="font-medium capitalize">{payment.paymentMethod.replace('_', ' ')}</span>
                </div>
                {payment.paymentReference && (
                    <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">Ref:</span>
                        <span className="font-mono text-xs">{payment.paymentReference}</span>
                    </div>
                )}
            </div>

            {payment.paymentProof && (
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    <img
                        src={payment.paymentProof}
                        alt="Proof of payment"
                        className="w-full h-32 object-cover rounded-lg border border-[var(--border)] cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(payment.paymentProof!, '_blank')}
                    />
                </div>
            )}
        </Card>
    );
};
