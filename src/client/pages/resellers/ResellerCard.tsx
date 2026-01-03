import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Phone,
    Edit,
    Trash2
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useResellerBalance } from '@/hooks/useResellers';
import { cn, formatCurrency } from '@/lib/utils';
import type { Reseller } from '@/lib/types';

interface ResellerCardProps {
    reseller: Reseller;
    onDelete: (id: number) => void;
}

export const ResellerCard: React.FC<ResellerCardProps> = ({ reseller, onDelete }) => {
    const navigate = useNavigate();
    const { data: balance, loading: loadingBalance } = useResellerBalance(reseller.id);

    const outstandingBalance = balance ? balance.totalOrders - balance.totalPayments : 0;

    return (
        <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-none bg-gradient-to-br from-card to-secondary/30">
            <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-6">
                    <div className="relative">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border-4 border-background shadow-sm">
                            <User className="h-8 w-8" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center shadow-sm">
                            <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xl truncate tracking-tight">{reseller.resellerName}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{reseller.resellerEmail}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-background/50 border border-border/50">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Due Balance</p>
                        <p className={cn(
                            "text-sm font-bold",
                            outstandingBalance > 0 ? "text-amber-500" : "text-emerald-500"
                        )}>
                            {loadingBalance ? "..." : formatCurrency(outstandingBalance)}
                        </p>
                    </div>
                    <div className="p-3 rounded-xl bg-background/50 border border-border/50">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Total Orders</p>
                        <p className="text-sm font-bold">
                            {loadingBalance ? "..." : (balance?.totalOrders || 0) / 1000 >= 1 ? `${((balance?.totalOrders || 0) / 1000).toFixed(1)}k` : formatCurrency(balance?.totalOrders || 0)}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 text-primary/60" />
                        <span>{reseller.resellerPhone}</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-4 bg-muted/20 flex gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-xs hover:bg-background h-9"
                    onClick={() => navigate(`/resellers/${reseller.id}/edit`)}
                >
                    <Edit className="mr-2 h-3.5 w-3.5" />
                    Edit
                </Button>
                <div className="w-px h-6 bg-border self-center" />
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-xs text-destructive hover:bg-destructive/10 h-9"
                    onClick={() => onDelete(reseller.id)}
                >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Delete
                </Button>
            </CardFooter>
        </Card>
    );
};

