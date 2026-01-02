import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStores, useStoreMutations } from '../../hooks/useStores';
import { StoreCard } from './StoreCard';
import { Button, Spinner, EmptyState } from '../../components';

export const StoresPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: stores, loading, error, refetch } = useStores();
    const { deleteAction } = useStoreMutations();

    const handleDelete = async (id: number) => {
        await deleteAction(id);
        refetch();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Stores</h1>
                <Button
                    variant="primary"
                    icon={<span className="text-xl">+</span>}
                    onClick={() => navigate('/stores/new')}
                >
                    New Store
                </Button>
            </div>

            {loading ? (
                <Spinner className="py-20" />
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex justify-between items-center">
                    <span>{error}</span>
                    <Button size="sm" variant="ghost" onClick={refetch}>Retry</Button>
                </div>
            ) : stores && stores.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stores.map((store) => (
                        <StoreCard key={store.id} store={store} onDelete={handleDelete} />
                    ))}
                </div>
            ) : (
                <EmptyState
                    title="No stores yet"
                    description="Keep track of where you buy your items. add your first store to get started!"
                    actionLabel="Add Store"
                    onAction={() => navigate('/stores/new')}
                    icon="🏪"
                />
            )}
        </div>
    );
};
