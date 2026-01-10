import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Store as StoreIcon,
    MapPin,
    Phone,
    Loader2,
    AlertCircle,
    Building2,
    Check,
    Image as ImageIcon,
    Upload,
    Trash2,
    Layout,
    Mail,
    FileText
} from 'lucide-react';
import { useStore, useStoreMutations } from '@/hooks/useStores';
import { uploadApi } from '@/lib/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HeaderContent } from '@/components/layout/HeaderProvider';
import { FormActions } from '@/components/ui/FormActions';
import type { CreateStoreDto } from '@/lib/types';

export const StoreForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const { data: store, loading: loadingStore } = useStore(Number(id));
    const { createAction, updateAction, loading: mutationLoading, error } = useStoreMutations();

    const [formData, setFormData] = useState<CreateStoreDto>({
        storeName: '',
        storeAddress: '',
        storePhone: '',
        storeEmail: '',
        storeDescription: '',
        storeLogo: '',
        storeCover: '',
        storeStatus: 'active',
    });

    const [uploading, setUploading] = useState<Record<string, boolean>>({});
    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        if (isEdit && store) {
            setFormData({
                storeName: store.storeName,
                storeAddress: store.storeAddress || '',
                storePhone: store.storePhone || '',
                storeEmail: store.storeEmail || '',
                storeDescription: store.storeDescription || '',
                storeLogo: store.storeLogo || '',
                storeCover: store.storeCover || '',
                storeStatus: store.storeStatus,
            });
        }
    }, [isEdit, store]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'storeLogo' | 'storeCover') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(prev => ({ ...prev, [field]: true }));
        setLocalError(null);

        const result = await uploadApi.upload(file);
        setUploading(prev => ({ ...prev, [field]: false }));

        if (result.success && result.data?.url) {
            setFormData(prev => ({ ...prev, [field]: result.data!.url }));
        } else {
            setLocalError(`Failed to upload ${field === 'storeLogo' ? 'logo' : 'cover'}`);
        }
    };

    const removeImage = (field: 'storeLogo' | 'storeCover') => {
        setFormData(prev => ({ ...prev, [field]: '' }));
    };

    const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
        if (e) e.preventDefault();
        setLocalError(null);

        let result;
        if (isEdit) {
            result = await updateAction({ id: Number(id), data: formData });
        } else {
            result = await createAction(formData);
        }

        if (result) {
            navigate('/stores');
        }
    };

    if (isEdit && loadingStore) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse font-medium">Loading details...</p>
            </div>
        );
    }

    const isUploadingAny = Object.values(uploading).some(Boolean);

    return (
        <div className="bg-background text-foreground font-sans min-h-screen pb-24">
            <HeaderContent title={isEdit ? 'Edit Store' : 'New Store'} />

            <main className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-4 pt-4 md:pt-6">
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-foreground tracking-tight mb-2 uppercase">
                        {isEdit ? 'Update Store' : 'Add Store'}
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium">
                        {isEdit ? 'Update your shopping location details.' : 'Register a new store for your pasabuy orders.'}
                    </p>
                </div>

                {(error || localError) && (
                    <div className="mb-8">
                        <Alert variant="destructive" className="rounded-2xl border-destructive/20 bg-destructive/5">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle className="font-bold">Action failed</AlertTitle>
                            <AlertDescription className="font-medium">
                                {error || localError}
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Media Section */}
                        <div className="lg:col-span-12 space-y-8">
                            <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50">
                                <div className="flex items-center mb-6">
                                    <div className="p-2 rounded-xl bg-primary/10 mr-3">
                                        <ImageIcon className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground tracking-tight">Store Branding</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Logo Upload */}
                                    <div className="space-y-4">
                                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Store Logo</label>
                                        {formData.storeLogo ? (
                                            <div className="relative aspect-square w-40 mx-auto group rounded-2xl overflow-hidden border border-border/50 animate-in fade-in zoom-in duration-300">
                                                <img src={formData.storeLogo} alt="Logo" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button type="button" onClick={() => removeImage('storeLogo')} className="p-2 bg-destructive text-destructive-foreground rounded-full hover:scale-110 transition-transform shadow-lg">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-border/60 rounded-2xl hover:border-primary/50 transition-colors cursor-pointer group bg-secondary/20 relative overflow-hidden min-h-[160px]">
                                                <div className="space-y-2 text-center my-auto">
                                                    <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors mx-auto" />
                                                    <div className="flex text-sm text-muted-foreground justify-center">
                                                        <label htmlFor="logo-upload" className="relative cursor-pointer rounded-md font-bold text-primary hover:text-primary-dark transition-colors">
                                                            <span>Upload Logo</span>
                                                        </label>
                                                    </div>
                                                </div>
                                                <input id="logo-upload" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'storeLogo')} accept="image/*" disabled={uploading.storeLogo} />
                                            </div>
                                        )}
                                        {uploading.storeLogo && <p className="text-center text-xs text-primary font-bold animate-pulse">Uploading...</p>}
                                    </div>

                                    {/* Cover Upload */}
                                    <div className="space-y-4">
                                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Cover Photo</label>
                                        {formData.storeCover ? (
                                            <div className="relative aspect-video w-full group rounded-2xl overflow-hidden border border-border/50 animate-in fade-in zoom-in duration-300">
                                                <img src={formData.storeCover} alt="Cover" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button type="button" onClick={() => removeImage('storeCover')} className="p-2 bg-destructive text-destructive-foreground rounded-full hover:scale-110 transition-transform shadow-lg">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-border/60 rounded-2xl hover:border-primary/50 transition-colors cursor-pointer group bg-secondary/20 relative overflow-hidden min-h-[160px]">
                                                <div className="space-y-2 text-center my-auto">
                                                    <Layout className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors mx-auto" />
                                                    <div className="flex text-sm text-muted-foreground justify-center">
                                                        <label htmlFor="cover-upload" className="relative cursor-pointer rounded-md font-bold text-primary hover:text-primary-dark transition-colors">
                                                            <span>Upload Cover</span>
                                                        </label>
                                                    </div>
                                                </div>
                                                <input id="cover-upload" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'storeCover')} accept="image/*" disabled={uploading.storeCover} />
                                            </div>
                                        )}
                                        {uploading.storeCover && <p className="text-center text-xs text-primary font-bold animate-pulse">Uploading...</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Basic Details */}
                        <div className="lg:col-span-7 space-y-8">
                            <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50">
                                <div className="flex items-center mb-6">
                                    <div className="p-2 rounded-xl bg-primary/10 mr-3">
                                        <Building2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground tracking-tight">Basic Details</h3>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="storeName" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Store Name</label>
                                        <div className="relative">
                                            <StoreIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
                                            <input
                                                type="text"
                                                id="storeName"
                                                name="storeName"
                                                value={formData.storeName}
                                                onChange={handleChange}
                                                placeholder="e.g. SM Megamall, Costco"
                                                className="w-full rounded-2xl border-border/60 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/40 py-4 pl-12 pr-4 border outline-none transition-all font-medium"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="storeAddress" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Location / Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-4 h-5 w-5 text-muted-foreground/40" />
                                            <textarea
                                                id="storeAddress"
                                                name="storeAddress"
                                                value={formData.storeAddress || ''}
                                                onChange={handleChange}
                                                placeholder="Enter full store location..."
                                                rows={3}
                                                className="w-full rounded-2xl border-border/60 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/40 py-4 pl-12 pr-4 border outline-none transition-all resize-none font-medium text-sm"
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="storeDescription" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">About the Store</label>
                                        <div className="relative">
                                            <FileText className="absolute left-4 top-4 h-5 w-5 text-muted-foreground/40" />
                                            <textarea
                                                id="storeDescription"
                                                name="storeDescription"
                                                value={formData.storeDescription || ''}
                                                onChange={handleChange}
                                                placeholder="Add details about store hours, membership, etc..."
                                                rows={3}
                                                className="w-full rounded-2xl border-border/60 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/40 py-4 pl-12 pr-4 border outline-none transition-all resize-none font-medium text-sm"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact & Status */}
                        <div className="lg:col-span-5 space-y-8">
                            <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50">
                                <div className="flex items-center mb-6">
                                    <div className="p-2 rounded-xl bg-primary/10 mr-3">
                                        <Phone className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground tracking-tight">Contact & Status</h3>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="storeEmail" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
                                            <input
                                                type="email"
                                                id="storeEmail"
                                                name="storeEmail"
                                                value={formData.storeEmail || ''}
                                                onChange={handleChange}
                                                placeholder="store@example.com"
                                                className="w-full rounded-2xl border-border/60 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/40 py-4 pl-12 pr-4 border outline-none transition-all font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="storePhone" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
                                            <input
                                                type="tel"
                                                id="storePhone"
                                                name="storePhone"
                                                value={formData.storePhone || ''}
                                                onChange={handleChange}
                                                placeholder="+63 ..."
                                                className="w-full rounded-2xl border-border/60 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/40 py-4 pl-12 pr-4 border outline-none transition-all font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">Store Status</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, storeStatus: 'active' }))}
                                                className={`flex items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all font-bold ${formData.storeStatus === 'active'
                                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600'
                                                    : 'bg-secondary/30 border-border/60 text-muted-foreground hover:border-primary/30'
                                                    }`}
                                            >
                                                Active
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, storeStatus: 'inactive' }))}
                                                className={`flex items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all font-bold ${formData.storeStatus === 'inactive'
                                                    ? 'bg-red-500/10 border-red-500 text-red-600'
                                                    : 'bg-secondary/30 border-border/60 text-muted-foreground hover:border-primary/30'
                                                    }`}
                                            >
                                                Inactive
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </main>

            <FormActions
                onCancel={() => navigate(-1)}
                onSave={handleSubmit}
                isSaving={mutationLoading || isUploadingAny}
                saveLabel={isEdit ? 'Update' : 'Save'}
                saveIcon={Check}
                disabled={mutationLoading || isUploadingAny}
            />
        </div>
    );
};
