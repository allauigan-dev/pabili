import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Input, Select, Spinner } from '../../components';
import { uploadApi } from '../../lib/api';
import { useStore, useStoreMutations } from '../../hooks/useStores';
import type { CreateStoreDto } from '../../lib/types';

export const StoreForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;
    const navigate = useNavigate();

    const { data: store, loading: storeLoading } = useStore(isEdit ? parseInt(id!) : 0);
    const { createAction, updateAction, loading: mutationLoading } = useStoreMutations();

    const [formData, setFormData] = useState<CreateStoreDto>({
        storeName: '',
        storeAddress: '',
        storePhone: '',
        storeEmail: '',
        storeDescription: '',
        storeStatus: 'active',
        storeLogo: '',
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (store) {
            setFormData({
                storeName: store.storeName,
                storeAddress: store.storeAddress || '',
                storePhone: store.storePhone || '',
                storeEmail: store.storeEmail || '',
                storeDescription: store.storeDescription || '',
                storeStatus: store.storeStatus,
                storeLogo: store.storeLogo || '',
            });
            if (store.storeLogo) setPreviewUrl(store.storeLogo);
        }
    }, [store]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let logoUrl = formData.storeLogo;

        if (logoFile) {
            setIsUploading(true);
            const uploadRes = await uploadApi.upload(logoFile);
            if (uploadRes.success && uploadRes.data) {
                logoUrl = uploadRes.data.url;
            } else {
                alert('Logo upload failed: ' + uploadRes.error);
                setIsUploading(false);
                return;
            }
            setIsUploading(false);
        }

        const finalData = { ...formData, storeLogo: logoUrl };

        if (isEdit) {
            await updateAction({ id: parseInt(id!), data: finalData });
        } else {
            await createAction(finalData);
        }

        navigate('/stores');
    };

    if (storeLoading) return <Spinner className="py-20" />;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                    ← Back
                </Button>
                <h1 className="text-2xl font-bold">{isEdit ? 'Edit Store' : 'New Store'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <Input
                            label="Store Name"
                            name="storeName"
                            value={formData.storeName}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Starbucks SM Aura"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <Input
                            label="Address"
                            name="storeAddress"
                            value={formData.storeAddress || ''}
                            onChange={handleChange}
                            placeholder="Complete address"
                        />
                    </div>

                    <Input
                        label="Phone Number"
                        name="storePhone"
                        value={formData.storePhone || ''}
                        onChange={handleChange}
                        placeholder="e.g. 09171234567"
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        name="storeEmail"
                        value={formData.storeEmail || ''}
                        onChange={handleChange}
                        placeholder="store@example.com"
                    />

                    <Select
                        label="Status"
                        name="storeStatus"
                        value={formData.storeStatus}
                        onChange={handleChange}
                        options={[
                            { value: 'active', label: 'Active' },
                            { value: 'inactive', label: 'Inactive' }
                        ]}
                    />

                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">Store Logo</label>
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-[var(--surface-hover)] rounded-full border-2 border-dashed border-[var(--border)] flex items-center justify-center overflow-hidden">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl">🏪</span>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="text-sm text-[var(--text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary-light)] file:text-[var(--primary)] hover:file:bg-[var(--primary-hover)] file:transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="ghost" type="button" onClick={() => navigate(-1)} disabled={isUploading || mutationLoading}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" isLoading={isUploading || mutationLoading}>
                        {isEdit ? 'Update Store' : 'Create Store'}
                    </Button>
                </div>
            </form>
        </div>
    );
};
