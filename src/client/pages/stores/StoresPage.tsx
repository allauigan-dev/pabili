import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    RefreshCcw,
    Plus,
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useStores, useStoreMutations } from '@/hooks/useStores';
import { StoreCard } from './StoreCard';
import { Button } from '@/components/ui/button';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { EmptyState } from '@/components/index';
import { HeaderContent } from '@/components/layout/HeaderProvider';
import { FilterPills } from '@/components/ui/FilterPills';

export const StoresPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: stores, loading, error, refetch } = useStores();
    const { deleteAction } = useStoreMutations();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (deleteId) {
            await deleteAction(deleteId);
            setDeleteId(null);
            refetch();
        }
    };

    const filteredStores = stores?.filter(s => {
        const matchesSearch = s.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.storeAddress?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' ? true : s.storeStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statusList = ['all', 'active', 'inactive'];

    const filterOptions = statusList.map(f => ({
        label: f,
        value: f,
        count: stores?.filter(s => f === 'all' ? true : s.storeStatus === f).length || 0
    }));

    return (
        <div className="relative pb-24">
            <HeaderContent
                title="Stores"
                showSearch={true}
                searchPlaceholder="Search stores..."
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                actions={
                    <Button variant="ghost" size="icon" onClick={refetch} className="rounded-full hover:bg-secondary">
                        <RefreshCcw className="h-5 w-5 text-muted-foreground" />
                    </Button>
                }
                filterContent={
                    <FilterPills
                        options={filterOptions}
                        activeValue={statusFilter}
                        onChange={setStatusFilter}
                    />
                }
            />

            <main className="space-y-4 pt-14">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 shadow-soft border border-border/50 h-32 animate-pulse" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-destructive/10 text-destructive p-6 rounded-xl border border-destructive/20 text-center">
                        <p className="font-medium mb-4">{error}</p>
                        <Button variant="outline" size="sm" onClick={refetch}>Retry</Button>
                    </div>
                ) : filteredStores && filteredStores.length > 0 ? (
                    <div className="space-y-4">
                        {filteredStores.map((store) => (
                            <StoreCard key={store.id} store={store} onDelete={handleDeleteClick} />
                        ))}
                        <Button
                            variant="outline"
                            className="w-full py-8 border-dashed border-2 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all mt-4 mb-8"
                            onClick={() => navigate('/stores/new')}
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Add New Store
                        </Button>
                    </div>
                ) : (
                    <EmptyState
                        title={searchQuery ? "No matching stores" : "No stores found"}
                        description={searchQuery
                            ? `We couldn't find any stores matching "${searchQuery}".`
                            : "You haven't added any stores yet."
                        }
                        actionLabel={!searchQuery ? "Add Store" : undefined}
                        onAction={() => navigate('/stores/new')}
                    />
                )}
            </main>

            {/* Floating Action Button */}
            <FloatingActionButton
                onClick={() => navigate('/stores/new')}
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Store?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this store? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
