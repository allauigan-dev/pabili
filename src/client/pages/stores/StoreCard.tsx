import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import type { Store } from '../../lib/types';

interface StoreCardProps {
    store: Store;
    onDelete?: (id: number) => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store, onDelete }) => {
    const navigate = useNavigate();

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete && window.confirm('Are you sure you want to delete this store?')) {
            onDelete(store.id);
        }
    };

    return (
        <Card
            className="hover:shadow-md transition-shadow group relative"
            onClick={() => navigate(`/stores/${store.id}/edit`)}
        >
            {onDelete && (
                <button
                    onClick={handleDelete}
                    className="absolute top-2 right-2 p-1.5 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 rounded-full z-10"
                    title="Delete Store"
                >
                    🗑️
                </button>
            )}
            <div className="flex items-center gap-4 pr-6">
                <div className="w-16 h-16 bg-[var(--surface-hover)] rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-[var(--border)]">
                    {store.storeLogo ? (
                        <img src={store.storeLogo} alt={store.storeName} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-2xl">🏪</span>
                    )}
                </div>

                <div className="min-w-0">
                    <h3 className="font-bold text-[var(--text-primary)] truncate">{store.storeName}</h3>
                    <p className="text-sm text-[var(--text-secondary)] truncate">{store.storeAddress || 'No address'}</p>
                    <div className="mt-1 flex items-center gap-2">
                        <Badge variant={store.storeStatus === 'active' ? 'success' : 'neutral'}>
                            {store.storeStatus}
                        </Badge>
                        {store.storePhone && (
                            <span className="text-xs text-[var(--text-muted)]">📞 {store.storePhone}</span>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};
