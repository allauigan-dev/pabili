import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    RefreshCcw,
    UserPlus
} from 'lucide-react';
import { useResellers, useResellerMutations } from '@/hooks/useResellers';
import { ResellerCard } from './ResellerCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/index';
import { Skeleton } from '@/components/ui/skeleton';

export const ResellersPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: resellers, loading, error, refetch } = useResellers();
    const { deleteAction } = useResellerMutations();
    const [searchQuery, setSearchQuery] = useState('');

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this reseller?')) {
            await deleteAction(id);
            refetch();
        }
    };

    const filteredResellers = resellers?.filter(r =>
        r.resellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.resellerEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Resellers</h1>
                    <p className="text-muted-foreground mt-1">Your network of business partners.</p>
                </div>
                <Button
                    onClick={() => navigate('/resellers/new')}
                    className="shadow-lg hover:shadow-primary/25 transition-all w-full sm:w-auto"
                >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Reseller
                </Button>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search resellers by name or email..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" onClick={refetch} size="icon" className="shrink-0">
                    <RefreshCcw className="h-4 w-4" />
                </Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-card rounded-xl p-6 space-y-4 border shadow-sm">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-16 w-16 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <Skeleton className="h-14 rounded-xl" />
                                <Skeleton className="h-14 rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="bg-destructive/10 text-destructive p-8 rounded-xl border border-destructive/20 text-center">
                    <p className="font-medium mb-4">{error}</p>
                    <Button variant="outline" onClick={refetch}>Retry</Button>
                </div>
            ) : filteredResellers && filteredResellers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResellers.map((reseller) => (
                        <ResellerCard key={reseller.id} reseller={reseller} onDelete={handleDelete} />
                    ))}
                </div>
            ) : (
                <EmptyState
                    title={searchQuery ? "No matching resellers" : "No resellers found"}
                    description={searchQuery
                        ? `We couldn't find any resellers matching "${searchQuery}".`
                        : "You haven't added any resellers yet. Build your network by adding your first reseller!"
                    }
                    actionLabel={!searchQuery ? "Add Reseller" : undefined}
                    onAction={() => navigate('/resellers/new')}
                />
            )}
        </div>
    );
};
