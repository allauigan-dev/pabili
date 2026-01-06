import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    MapPin,
    Phone,
    Edit,
    ArrowLeft,
    Building2,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { useStore } from '@/hooks/useStores';
import { HeaderContent } from '@/components/layout/HeaderProvider';
import { FormActions } from '@/components/ui/FormActions';

export const StoreDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: store, loading } = useStore(Number(id));

    if (loading || !store) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground animate-pulse font-medium">Loading store details...</p>
            </div>
        );
    }

    const isActive = store.storeStatus === 'active';

    return (
        <div className="bg-background text-foreground font-sans min-h-screen pb-24">
            <HeaderContent
                title="Store Details"
                actions={
                    <button
                        onClick={() => navigate('/stores')}
                        className="p-2 hover:bg-secondary rounded-full transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                }
            />

            <main className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-4 pt-4 md:pt-6">
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        {isActive ? (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                <CheckCircle2 className="h-3 w-3" />
                                Active
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                <XCircle className="h-3 w-3" />
                                Inactive
                            </div>
                        )}
                    </div>
                    <h2 className="text-3xl font-black text-foreground tracking-tight">{store.storeName}</h2>
                </div>

                <div className="bg-card rounded-3xl p-8 shadow-soft border border-border/50">
                    <div className="flex items-center mb-8 border-b border-border/50 pb-6">
                        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mr-5">
                            <Building2 className="h-8 w-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Contact & Location</h3>
                            <p className="text-muted-foreground">Information for runners and orders</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-secondary/30 transition-colors hover:bg-secondary/50">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="p-2 rounded-xl bg-background shadow-sm text-foreground">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Address</label>
                                    <p className="font-semibold text-lg">{store.storeAddress || 'No address provided'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-secondary/30 transition-colors hover:bg-secondary/50">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="p-2 rounded-xl bg-background shadow-sm text-foreground">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Contact Number</label>
                                    <p className="font-semibold text-lg">{store.storePhone || 'No contact info'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <FormActions
                onCancel={() => navigate(-1)}
                onSave={() => navigate(`/stores/${id}/edit`)}
                saveLabel="Update"
                saveIcon={Edit}
                cancelLabel="Back"
            />
        </div>
    );
};
