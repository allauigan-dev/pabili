import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
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
import { Input } from '@/components/ui/input';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { EmptyState } from '@/components/index';
// Skeleton is replaced by custom div pulse

export const StoresPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: stores, loading, error, refetch } = useStores();
    const { deleteAction } = useStoreMutations();
    const [searchQuery, setSearchQuery] = useState('');
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

    const filteredStores = stores?.filter(s =>
        s.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.storeAddress?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="relative pb-24 min-h-screen px-4">
            <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm -mx-4 px-4 pt-4 pb-2 transition-all">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Stores</h1>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={refetch} className="rounded-full hover:bg-secondary">
                            <RefreshCcw className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </div>
                </div>

                <div className="relative mb-2">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <Input
                            placeholder="Search stores..."
                            className="block w-full pl-10 pr-3 h-12 border-none rounded-xl bg-surface-light dark:bg-surface-dark shadow-sm ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm transition-shadow text-foreground placeholder:text-muted-foreground"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <main className="space-y-4 pt-2">
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
