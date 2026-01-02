import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useResellers, useResellerMutations } from '../../hooks/useResellers';
import { ResellerCard } from './ResellerCard';
import { Button, Spinner, EmptyState } from '../../components';

export const ResellersPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: resellers, loading, error, refetch } = useResellers();
    const { deleteAction } = useResellerMutations();

    const handleDelete = async (id: number) => {
        await deleteAction(id);
        refetch();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Resellers</h1>
                <Button
                    variant="primary"
                    icon={<span className="text-xl">+</span>}
                    onClick={() => navigate('/resellers/new')}
                >
                    New Reseller
                </Button>
            </div>

            {loading ? (
                <Spinner className="py-20" />
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex justify-between items-center">
                    <span>{error}</span>
                    <Button size="sm" variant="ghost" onClick={refetch}>Retry</Button>
                </div>
            ) : resellers && resellers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resellers.map((reseller) => (
                        <ResellerCard key={reseller.id} reseller={reseller} onDelete={handleDelete} />
                    ))}
                </div>
            ) : (
                <EmptyState
                    title="No resellers yet"
                    description="Professional resellers help you grow your business. Add your first reseller partnership!"
                    actionLabel="Add Reseller"
                    onAction={() => navigate('/resellers/new')}
                    icon="👥"
                />
            )}
        </div>
    );
};
