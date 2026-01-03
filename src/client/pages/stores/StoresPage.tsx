import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    RefreshCcw,
} from 'lucide-react';
import { useStores, useStoreMutations } from '@/hooks/useStores';
import { StoreCard } from './StoreCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/index';
import {
    Card,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const StoresPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: stores, loading, error, refetch } = useStores();
    const { deleteAction } = useStoreMutations();
    const [searchQuery, setSearchQuery] = useState('');

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this store?')) {
            await deleteAction(id);
            refetch();
        }
    };

    const filteredStores = stores?.filter(s =>
        s.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.storeAddress?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Stores</h1>
                    <p className="text-muted-foreground mt-1">Manage physical locations where you shop.</p>
                </div>
                <Button
                    onClick={() => navigate('/stores/new')}
                    className="shadow-lg hover:shadow-primary/25 transition-all w-full sm:w-auto"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Store
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search stores by name or location..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" onClick={refetch} size="icon" title="Refresh">
                    <RefreshCcw className="h-4 w-4" />
                </Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-14 w-14 rounded-2xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            </div>
                            <div className="space-y-2 mt-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : error ? (
                <div className="bg-destructive/10 text-destructive p-6 rounded-xl border border-destructive/20 text-center">
                    <p className="font-medium mb-4">{error}</p>
                    <Button variant="outline" size="sm" onClick={refetch}>Retry</Button>
                </div>
            ) : filteredStores && filteredStores.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStores.map((store) => (
                        <StoreCard key={store.id} store={store} onDelete={handleDelete} />
                    ))}
                </div>
            ) : (
                <EmptyState
                    title={searchQuery ? "No matching stores" : "No stores found"}
                    description={searchQuery
                        ? `We couldn't find any stores matching "${searchQuery}".`
                        : "You haven't added any stores yet. Start by adding a store where you frequently shop!"
                    }
                    actionLabel={!searchQuery ? "Add Store" : undefined}
                    onAction={() => navigate('/stores/new')}
                />
            )}
        </div>
    );
};
