import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Store as StoreIcon,
    MapPin,
    Phone,
    Edit,
    Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import type { Store } from '@/lib/types';

interface StoreCardProps {
    store: Store;
    onDelete: (id: number) => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store, onDelete }) => {
    const navigate = useNavigate();

    const isActive = store.storeStatus === 'active';
    const statusColor = isActive ? 'bg-emerald-500' : 'bg-slate-400';
    const statusBadge = isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800';

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 shadow-soft border border-border/50 relative group overflow-hidden mb-4">
            {/* Status Strip */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusColor} rounded-l-2xl`}></div>

            <div className="flex gap-4">
                {/* Icon/Image Section */}
                <div className="flex-shrink-0 w-20 h-20 bg-secondary/30 rounded-xl overflow-hidden border border-border/50 relative flex items-center justify-center">
                    <span className={`absolute top-0 right-0 text-[9px] font-bold px-1.5 py-0.5 rounded-bl-md z-10 uppercase ${statusBadge}`}>
                        {store.storeStatus}
                    </span>
                    <StoreIcon className={`h-8 w-8 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div className="flex justify-between items-start">
                        <div className="min-w-0 pr-2">
                            <h3 className="text-base font-bold text-foreground truncate">{store.storeName}</h3>
                            <div className="flex flex-col gap-1 mt-1">
                                {store.storeAddress && (
                                    <div className="flex items-center text-xs text-muted-foreground">
                                        <MapPin className="h-3.5 w-3.5 mr-1 opacity-70 flex-shrink-0" />
                                        <span className="truncate">{store.storeAddress}</span>
                                    </div>
                                )}
                                {store.storePhone && (
                                    <div className="flex items-center text-xs text-muted-foreground">
                                        <Phone className="h-3.5 w-3.5 mr-1 opacity-70 flex-shrink-0" />
                                        <span className="truncate">{store.storePhone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end items-center mt-3 gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                            onClick={() => navigate(`/stores/${store.id}/edit`)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                            onClick={() => onDelete(store.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
