import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle2,
    Clock,
    MoreVertical,
    Edit,
    Trash2,
    ExternalLink,
    Image as ImageIcon
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Payment } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PaymentCardProps {
    payment: Payment;
    onDelete?: (id: number) => void;
    onConfirm?: (id: number) => void;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({ payment, onDelete, onConfirm }) => {
    const navigate = useNavigate();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const statusInfo = {
        pending: { label: 'Pending', icon: Clock, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
        confirmed: { label: 'Confirmed', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
        rejected: { label: 'Rejected', icon: Clock, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
    }[payment.paymentStatus as 'pending' | 'confirmed' | 'rejected'] || { label: 'Unknown', icon: Clock, color: 'text-muted-foreground' };

    const isConfirmed = payment.paymentStatus === 'confirmed';
    const confirmedAt = payment.confirmedAt;

    return (
        <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-none bg-gradient-to-br from-card to-secondary/30 flex flex-col sm:flex-row">
            <div className="md:w-32 lg:w-40 aspect-[3/4] md:aspect-auto h-48 md:h-auto bg-muted transition-transform group-hover:scale-105 duration-500 relative shrink-0">
                {payment.paymentProof ? (
                    <>
                        <img
                            src={payment.paymentProof}
                            alt="Proof"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button variant="secondary" size="sm" onClick={() => window.open(payment.paymentProof!, '_blank')}>
                                <ExternalLink className="mr-2 h-4 w-4" /> View Large
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                        <ImageIcon className="h-8 w-8" />
                    </div>
                )}

                <div className="absolute top-2 left-2">
                    <Badge className={cn(
                        "capitalize shadow-sm backdrop-blur-md",
                        isConfirmed ? "bg-emerald-500 hover:bg-emerald-600" : "bg-background/60 text-amber-500 border-amber-500/30"
                    )}>
                        {statusInfo.label}
                    </Badge>
                </div>
            </div>

            <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <div className="min-w-0">
                        <div className="flex flex-col mb-1">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest leading-none mb-1">Reseller</p>
                            <h3 className="font-bold text-lg truncate tracking-tight">{payment.resellerName || `Reseller ID: ${payment.resellerId}`}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Paid on {new Date(payment.paymentDate).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/payments/${payment.id}/edit`)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => onDelete?.(payment.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex flex-wrap items-end justify-between mt-auto pt-4 border-t border-primary/5">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-0.5">Reference</p>
                        <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                            {payment.paymentReference || 'N/A'}
                        </code>
                    </div>

                    <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-0.5">Amount</p>
                        <p className="text-2xl font-black text-primary leading-none">
                            {formatCurrency(payment.paymentAmount)}
                        </p>
                    </div>
                </div>

                <div className="mt-4 flex gap-2">
                    {!isConfirmed ? (
                        <Button
                            className="flex-1 h-8 text-xs font-bold"
                            size="sm"
                            onClick={() => onConfirm?.(payment.id)}
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Confirm
                        </Button>
                    ) : (
                        <div className={cn("flex-1 flex items-center justify-center gap-2 text-[10px] font-bold px-3 py-1 rounded-lg", statusInfo.color)}>
                            <statusInfo.icon className="h-4 w-4" />
                            {statusInfo.label} {confirmedAt && `at ${new Date(confirmedAt).toLocaleDateString()}`}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};
