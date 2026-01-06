import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle2,
    Edit,
    Trash2,
    Calendar,
    User,
    Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import type { Payment } from '@/lib/types';

interface PaymentCardProps {
    payment: Payment;
    onDelete?: (id: number) => void;
    onConfirm?: (id: number) => void;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({ payment, onDelete, onConfirm }) => {
    const navigate = useNavigate();

    const statusConfig = {
        pending: {
            bar: 'bg-amber-400',
            badge: 'bg-amber-100 text-amber-800',
            label: 'PENDING'
        },
        confirmed: {
            bar: 'bg-emerald-500',
            badge: 'bg-emerald-100 text-emerald-800',
            label: 'CONFIRMED'
        },
        rejected: {
            bar: 'bg-rose-500',
            badge: 'bg-rose-100 text-rose-800',
            label: 'REJECTED'
        },
    };

    const status = statusConfig[payment.paymentStatus as keyof typeof statusConfig] || statusConfig.pending;
    const isConfirmed = payment.paymentStatus === 'confirmed';

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 shadow-soft border border-border/50 relative group overflow-hidden mb-4">
            {/* Status Strip */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${status.bar} rounded-l-2xl`}></div>

            <div className="flex gap-4">
                {/* Image Section */}
                <div className="flex-shrink-0 w-20 h-20 bg-secondary/30 rounded-xl overflow-hidden border border-border/50 relative">
                    <span className={`absolute top-0 right-0 text-[9px] font-bold px-1.5 py-0.5 rounded-bl-md z-10 ${status.badge}`}>
                        {status.label}
                    </span>

                    {payment.paymentProof ? (
                        <Dialog>
                            <DialogTrigger asChild>
                                <img
                                    src={payment.paymentProof}
                                    alt="Payment Proof"
                                    className="w-full h-full object-cover cursor-zoom-in"
                                />
                            </DialogTrigger>
                            <DialogContent className="max-w-[95vw] sm:max-w-[90vw] h-auto max-h-[90vh] p-1 border-none bg-transparent shadow-none">
                                <DialogTitle className="sr-only">Payment Proof</DialogTitle>
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <img
                                        src={payment.paymentProof}
                                        alt="Proof"
                                        className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary/30">
                            <ImageIcon className="h-6 w-6 text-muted-foreground opacity-50" />
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div className="flex justify-between items-start">
                        <div className="min-w-0 pr-2">
                            <h3 className="text-base font-bold text-foreground truncate">{payment.customerName}</h3>
                            <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-3">
                                <span className="flex items-center truncate">
                                    <User className="h-3.5 w-3.5 mr-1 opacity-70" />
                                    {payment.paymentReference || 'No Ref'}
                                </span>
                                <span className="flex items-center">
                                    <Calendar className="h-3.5 w-3.5 mr-1 opacity-70" />
                                    {new Date(payment.paymentDate).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <p className="text-primary font-bold text-base whitespace-nowrap">
                            {formatCurrency(payment.paymentAmount)}
                        </p>
                    </div>

                    <div className="flex justify-end items-center mt-3 gap-2">
                        {!isConfirmed && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                                onClick={() => onConfirm?.(payment.id)}
                                title="Confirm Payment"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                            onClick={() => navigate(`/payments/${payment.id}/edit`)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                            onClick={() => onDelete?.(payment.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
