import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Phone,
    Edit,
    Trash2,
    UserX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { Customer } from '@/lib/types';

interface CustomerCardProps {
    customer: Customer;
    onDelete: (id: number) => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onDelete }) => {
    const navigate = useNavigate();

    // Use balance from customer object directly (already fetched with customer list)
    const outstandingBalance = customer.balance ?? 0;
    const hasBalance = outstandingBalance > 0;

    // Balance status
    const balanceBadge = hasBalance ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800';
    const balanceLabel = hasBalance ? 'OWING' : 'GOOD';

    // Customer status - determines the left strip color
    const isActive = customer.customerStatus === 'active';
    const statusStripColor = isActive ? (hasBalance ? 'bg-amber-400' : 'bg-emerald-500') : 'bg-gray-400';

    return (
        <div
            className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 shadow-soft border border-border/50 relative group overflow-hidden mb-4 cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => navigate(`/customers/${customer.id}`)}
        >
            {/* Status Strip - gray for inactive customers */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusStripColor} rounded-l-2xl`}></div>

            <div className="flex gap-4">
                {/* Icon/Image Section */}
                <div className="flex-shrink-0 w-20 h-20 bg-secondary/30 rounded-xl overflow-hidden border border-border/50 relative flex items-center justify-center">
                    <span className={`absolute top-0 right-0 text-[9px] font-bold px-1.5 py-0.5 rounded-bl-md z-10 uppercase ${balanceBadge}`}>
                        {balanceLabel}
                    </span>
                    {customer.customerPhoto ? (
                        <img
                            src={customer.customerPhoto}
                            alt={customer.customerName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <User className="h-8 w-8 text-muted-foreground" />
                    )}
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                    <div className="flex justify-between items-stretch">
                        <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-foreground truncate">{customer.customerName}</h3>
                                {/* Customer status badge */}
                                {!isActive && (
                                    <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 uppercase">
                                        <UserX className="h-2.5 w-2.5" />
                                        Inactive
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col gap-1 mt-1">
                                <div className="items-center text-xs text-muted-foreground flex">
                                    <Mail className="h-3.5 w-3.5 mr-1 opacity-70 flex-shrink-0" />
                                    <span className="truncate">{customer.customerEmail || 'No email'}</span>
                                </div>
                                {customer.customerPhone && (
                                    <div className="flex items-center text-xs text-muted-foreground">
                                        <Phone className="h-3.5 w-3.5 mr-1 opacity-70 flex-shrink-0" />
                                        <span className="truncate">{customer.customerPhone}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-end justify-between pl-2">
                            <div className="flex items-baseline gap-1">
                                <p className={`font-bold text-base whitespace-nowrap ${hasBalance ? 'text-amber-600' : 'text-emerald-600'}`}>
                                    {formatCurrency(outstandingBalance)}
                                </p>
                                <span className="text-[9px] text-muted-foreground uppercase font-medium">Due</span>
                            </div>

                            <div className="flex items-center gap-0.5 mt-2" onClick={(e) => e.stopPropagation()}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                                    onClick={() => navigate(`/customers/${customer.id}/edit`)}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                                    onClick={() => onDelete(customer.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
