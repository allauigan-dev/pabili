import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Package,
    Trash2,
    Edit,
    MoreVertical,
    Calendar,
    Users
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/utils';
import type { Order } from '@/lib/types';

interface OrderCardProps {
    order: Order;
    onDelete: (id: number) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onDelete }) => {
    const navigate = useNavigate();

    const statusColors = {
        pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        bought: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        packed: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
        delivered: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    };

    return (
        <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-none bg-gradient-to-br from-card to-secondary/20">
            <div className="relative aspect-[4/3] overflow-hidden">
                {order.orderImage ? (
                    <img
                        src={order.orderImage}
                        alt={order.orderName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground opacity-20" />
                    </div>
                )}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <Badge className={`capitalize shadow-sm ${statusColors[order.orderStatus as keyof typeof statusColors]}`}>
                        {order.orderStatus}
                    </Badge>
                </div>

                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/orders/${order.id}/edit`)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(order.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-background/60 backdrop-blur-md text-[10px] font-bold text-foreground w-fit">
                        <span className="text-primary truncate max-w-[100px]">{order.storeName}</span>
                    </div>
                </div>
            </div>

            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg truncate flex-1 pr-2">{order.orderName}</h3>
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-primary">{formatCurrency(order.orderResellerTotal)}</span>
                        <span className="text-[10px] text-muted-foreground line-through opacity-50">{formatCurrency(order.orderStoreTotal)}</span>
                    </div>
                </div>

                <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5 text-primary/70" />
                        <span className="truncate">Reseller: <span className="text-foreground font-medium">{order.resellerName}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 text-primary/70" />
                        <span>Created: <span className="text-foreground font-medium">{new Date(order.createdAt).toLocaleDateString()}</span></span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => navigate(`/orders/${order.id}/edit`)}
                >
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => onDelete(order.id)}
                >
                    <Trash2 className="mr-2 h-3 w-3" />
                    Delete
                </Button>
            </CardFooter>
        </Card>
    );
};
