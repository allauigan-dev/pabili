import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Input, Select, Spinner } from '../../components';
import { useReseller, useResellerMutations } from '../../hooks/useResellers';
import { uploadApi } from '../../lib/api';
import type { CreateResellerDto } from '../../lib/types';

export const ResellerForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;
    const navigate = useNavigate();

    const { data: reseller, loading: resellerLoading } = useReseller(isEdit ? parseInt(id!) : 0);
    const { createAction, updateAction, loading: mutationLoading } = useResellerMutations();

    const [formData, setFormData] = useState<CreateResellerDto>({
        resellerName: '',
        resellerPhone: '',
        resellerEmail: '',
        resellerAddress: '',
        resellerStatus: 'active',
        resellerPhoto: '',
        resellerDescription: '',
    });

    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (reseller) {
            setFormData({
                resellerName: reseller.resellerName,
                resellerPhone: reseller.resellerPhone || '',
                resellerEmail: reseller.resellerEmail || '',
                resellerAddress: reseller.resellerAddress || '',
                resellerStatus: reseller.resellerStatus,
                resellerPhoto: reseller.resellerPhoto || '',
                resellerDescription: reseller.resellerDescription || '',
            });
            if (reseller.resellerPhoto) setPreviewUrl(reseller.resellerPhoto);
        }
    }, [reseller]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let photoUrl = formData.resellerPhoto;

        if (photoFile) {
            setIsUploading(true);
            const uploadRes = await uploadApi.upload(photoFile);
            if (uploadRes.success && uploadRes.data) {
                photoUrl = uploadRes.data.url;
            } else {
                alert('Photo upload failed: ' + uploadRes.error);
                setIsUploading(false);
                return;
            }
            setIsUploading(false);
        }

        const finalData = { ...formData, resellerPhoto: photoUrl };

        if (isEdit) {
            await updateAction({ id: parseInt(id!), data: finalData });
        } else {
            await createAction(finalData);
        }

        navigate('/resellers');
    };

    if (resellerLoading) return <Spinner className="py-20" />;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                    ← Back
                </Button>
                <h1 className="text-2xl font-bold">{isEdit ? 'Edit Reseller' : 'New Reseller'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 text-center pb-4">
                        <div className="relative inline-block">
                            <div className="w-24 h-24 bg-[var(--primary-light)] rounded-full border-2 border-[var(--primary)] flex items-center justify-center overflow-hidden mx-auto mb-2">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl text-[var(--primary)] font-bold">
                                        {formData.resellerName ? formData.resellerName.charAt(0) : '?'}
                                    </span>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-[var(--primary)] text-white p-1.5 rounded-full cursor-pointer shadow-lg hover:bg-[var(--primary-hover)] transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                            </label>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-2">Upload profile photo</p>
                    </div>

                    <div className="md:col-span-2">
                        <Input
                            label="Full Name"
                            name="resellerName"
                            value={formData.resellerName}
                            onChange={handleChange}
                            required
                            placeholder="John Doe"
                        />
                    </div>

                    <Input
                        label="Phone Number"
                        name="resellerPhone"
                        value={formData.resellerPhone || ''}
                        onChange={handleChange}
                        placeholder="09171234567"
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        name="resellerEmail"
                        value={formData.resellerEmail || ''}
                        onChange={handleChange}
                        placeholder="reseller@example.com"
                    />

                    <div className="md:col-span-2">
                        <Input
                            label="Home Address"
                            name="resellerAddress"
                            value={formData.resellerAddress || ''}
                            onChange={handleChange}
                            placeholder="Full home address"
                        />
                    </div>

                    <Select
                        label="Status"
                        name="resellerStatus"
                        value={formData.resellerStatus}
                        onChange={handleChange}
                        options={[
                            { value: 'active', label: 'Active' },
                            { value: 'inactive', label: 'Inactive' }
                        ]}
                    />

                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)] mb-1 block">Description / Notes</label>
                        <textarea
                            name="resellerDescription"
                            value={formData.resellerDescription || ''}
                            onChange={handleChange}
                            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-2 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none h-24"
                            placeholder="Notes about the reseller partnership"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="ghost" type="button" onClick={() => navigate(-1)} disabled={isUploading || mutationLoading}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" isLoading={isUploading || mutationLoading}>
                        {isEdit ? 'Update Reseller' : 'Create Reseller'}
                    </Button>
                </div>
            </form>
        </div>
    );
};
