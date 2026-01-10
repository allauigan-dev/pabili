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
        <div
            className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 shadow-soft border border-border/50 relative group overflow-hidden mb-4 cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => navigate(`/stores/${store.id}`)}
        >
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
                <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                    <h3 className="text-base font-bold text-foreground truncate mb-0.5">{store.storeName}</h3>

                    <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center text-xs text-muted-foreground min-w-0 pr-2">
                                <MapPin className="h-3.5 w-3.5 mr-1 opacity-70 flex-shrink-0" />
                                <span className="truncate">{store.storeAddress || 'No location'}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors -mr-1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/stores/${store.id}/edit`);
                                }}
                            >
                                <Edit className="h-3.5 w-3.5" />
                            </Button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center text-xs text-muted-foreground min-w-0 pr-2">
                                <Phone className="h-3.5 w-3.5 mr-1 opacity-70 flex-shrink-0" />
                                <span className="truncate">{store.storePhone || 'No contact'}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10 transition-colors -mr-1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(store.id);
                                }}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
