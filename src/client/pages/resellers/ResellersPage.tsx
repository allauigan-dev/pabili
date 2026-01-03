import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    RefreshCcw,
    UserPlus,

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
import { useResellers, useResellerMutations } from '@/hooks/useResellers';
import { ResellerCard } from './ResellerCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/index';
// Skeleton is replaced by custom div pulse

export const ResellersPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: resellers, loading, error, refetch } = useResellers();
    const { deleteAction } = useResellerMutations();
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

    const filteredResellers = resellers?.filter(r =>
        r.resellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.resellerEmail && r.resellerEmail.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="relative pb-24 min-h-screen -mx-2 -my-1 px-4 pt-2 md:mx-0 md:my-0 md:px-0">
            <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm -mx-4 px-4 pt-4 pb-2 md:mx-0 md:px-0 transition-all">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Resellers</h1>
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
                            placeholder="Search resellers..."
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
                    <div className="bg-destructive/10 text-destructive p-8 rounded-xl border border-destructive/20 text-center">
                        <p className="font-medium mb-4">{error}</p>
                        <Button variant="outline" onClick={refetch}>Retry</Button>
                    </div>
                ) : filteredResellers && filteredResellers.length > 0 ? (
                    <div className="space-y-4">
                        {filteredResellers.map((reseller) => (
                            <ResellerCard key={reseller.id} reseller={reseller} onDelete={handleDeleteClick} />
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
            </main>

            {/* Floating Action Button */}
            <div className="fixed bottom-24 right-4 z-40">
                <Button
                    onClick={() => navigate('/resellers/new')}
                    className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-fab hover:bg-primary-dark transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                >
                    <UserPlus className="h-6 w-6" />
                </Button>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Reseller?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this reseller? This action cannot be undone.
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
