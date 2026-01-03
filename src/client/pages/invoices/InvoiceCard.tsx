import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MoreVertical,
    Edit,
    Trash2,
    Download,
    User,
    Calendar,
    Receipt
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { Invoice } from '@/lib/types';
import { cn, formatCurrency } from '@/lib/utils';

interface InvoiceCardProps {
    invoice: Invoice;
    onDelete?: (id: number) => void;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, onDelete }) => {
    const navigate = useNavigate();

    const statusConfig = {
        draft: { color: 'bg-slate-500', label: 'Draft' },
        pending: { color: 'bg-amber-500', label: 'Pending' },
        sent: { color: 'bg-blue-500', label: 'Sent' },
        paid: { color: 'bg-emerald-500', label: 'Paid' },
        partial: { color: 'bg-indigo-500', label: 'Partial' },
        overdue: { color: 'bg-rose-500', label: 'Overdue' },
        cancelled: { color: 'bg-gray-500', label: 'Cancelled' },
    }[invoice.invoiceStatus] || { color: 'bg-slate-500', label: invoice.invoiceStatus };

    return (
        <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-none bg-gradient-to-br from-card to-secondary/30">
            <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                            <Receipt className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-lg tracking-tight">{invoice.invoiceNumber}</h3>
                                <Badge className={cn("text-[10px] h-5 transition-transform group-hover:scale-105", statusConfig.color)}>
                                    {statusConfig.label}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Created {new Date(invoice.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/invoices/${invoice.id}/edit`)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => onDelete?.(invoice.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-xl bg-secondary/20">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-1">
                            <User className="h-3 w-3" /> Reseller
                        </p>
                        <p className="text-sm font-bold truncate">{invoice.resellerName || `ID: ${invoice.resellerId}`}</p>
                    </div>
                    <div className="text-right space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Orders</p>
                        <p className="text-sm font-bold">{(invoice.orderIds || []).length} items</p>
                    </div>
                </div>

                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Balance Due</p>
                        <p className={cn(
                            "text-sm font-bold",
                            invoice.invoiceBalance > 0 ? "text-rose-500" : "text-emerald-500"
                        )}>
                            {formatCurrency(invoice.invoiceBalance)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Total Amount</p>
                        <p className="text-2xl font-black text-primary leading-none">
                            {formatCurrency(invoice.invoiceTotal)}
                        </p>
                    </div>
                </div>
            </div>

            <CardContent className="px-6 py-3 bg-secondary/20 flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-8 bg-background/50 hover:bg-background"
                >
                    <Download className="mr-2 h-3.5 w-3.5" />
                    Download PDF
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-xs h-8"
                    onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                >
                    View Details
                </Button>
            </CardContent>
        </Card>
    );
};
