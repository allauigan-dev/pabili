import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import type { Reseller } from '../../lib/types';

interface ResellerCardProps {
    reseller: Reseller;
    onDelete?: (id: number) => void;
}

export const ResellerCard: React.FC<ResellerCardProps> = ({ reseller, onDelete }) => {
    const navigate = useNavigate();

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete && window.confirm('Are you sure you want to delete this reseller?')) {
            onDelete(reseller.id);
        }
    };

    return (
        <Card
            className="hover:shadow-md transition-shadow group relative"
            onClick={() => navigate(`/resellers/${reseller.id}/edit`)}
        >
            {onDelete && (
                <button
                    onClick={handleDelete}
                    className="absolute top-2 right-2 p-1.5 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 rounded-full z-10"
                    title="Delete Reseller"
                >
                    🗑️
                </button>
            )}
            <div className="flex items-center gap-4 pr-6">
                <div className="w-16 h-16 bg-[var(--primary-light)] rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-[var(--border)]">
                    {reseller.resellerPhoto ? (
                        <img src={reseller.resellerPhoto} alt={reseller.resellerName} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-2xl text-[var(--primary)] font-bold">
                            {reseller.resellerName.charAt(0)}
                        </span>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-[var(--text-primary)] truncate">{reseller.resellerName}</h3>
                        <Badge variant={reseller.resellerStatus === 'active' ? 'success' : 'neutral'}>
                            {reseller.resellerStatus}
                        </Badge>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] truncate">{reseller.resellerPhone || reseller.resellerEmail || 'No contact info'}</p>
                    <div className="mt-2 text-sm text-[var(--text-muted)]">
                        Added: {new Date(reseller.createdAt).toLocaleDateString()}
                    </div>
                </div>
            </div>
        </Card>
    );
};
