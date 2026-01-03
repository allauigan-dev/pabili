import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Store as StoreIcon,
    MapPin,
    Phone,
    Edit,
    Trash2
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Store } from '@/lib/types';

interface StoreCardProps {
    store: Store;
    onDelete: (id: number) => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store, onDelete }) => {
    const navigate = useNavigate();

    return (
        <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-none bg-gradient-to-br from-card to-secondary/20">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-inner">
                            <StoreIcon className="h-7 w-7" />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl tracking-tight leading-none mb-1">{store.storeName}</h3>
                            <Badge variant={store.storeStatus === 'active' ? 'default' : 'secondary'} className="text-[10px] h-5 px-1.5 uppercase tracking-wider">
                                {store.storeStatus}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mt-6">
                    {store.storeLocation && (
                        <div className="flex items-start gap-3 text-sm text-muted-foreground group/item">
                            <MapPin className="h-4 w-4 mt-0.5 text-primary/70 group-hover/item:text-primary transition-colors" />
                            <span className="leading-tight">{store.storeLocation}</span>
                        </div>
                    )}
                    {store.storeContact && (
                        <div className="flex items-center gap-3 text-sm text-muted-foreground group/item">
                            <Phone className="h-4 w-4 text-primary/70 group-hover/item:text-primary transition-colors" />
                            <span>{store.storeContact}</span>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="p-4 bg-secondary/10 flex gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-xs hover:bg-background h-9"
                    onClick={() => navigate(`/stores/${store.id}/edit`)}
                >
                    <Edit className="mr-2 h-3.5 w-3.5" />
                    Edit
                </Button>
                <div className="w-px h-6 bg-border self-center" />
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive h-9"
                    onClick={() => onDelete(store.id)}
                >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Delete
                </Button>
            </CardFooter>
        </Card>
    );
};
