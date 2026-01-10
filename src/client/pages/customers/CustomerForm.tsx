import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    User,
    Mail,
    Phone,
    Loader2,
    AlertCircle,
    Check,
    Image as ImageIcon,
    Upload,
    Trash2,
    UserCircle,
    MapPin,
    FileText
} from 'lucide-react';
import { useCustomer, useCustomerMutations } from '@/hooks/useCustomers';
import { uploadApi } from '@/lib/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HeaderContent } from '@/components/layout/HeaderProvider';
import { FormActions } from '@/components/ui/FormActions';
import type { CreateCustomerDto } from '@/lib/types';

export const CustomerForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const { data: customer, loading: loadingCustomer } = useCustomer(Number(id));
    const { createAction, updateAction, loading: mutationLoading, error } = useCustomerMutations();

    const [formData, setFormData] = useState<CreateCustomerDto>({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        customerDescription: '',
        customerPhoto: '',
        customerStatus: 'active',
    });

    const [uploading, setUploading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        if (isEdit && customer) {
            setFormData({
                customerName: customer.customerName,
                customerEmail: customer.customerEmail || '',
                customerPhone: customer.customerPhone || '',
                customerAddress: customer.customerAddress || '',
                customerDescription: customer.customerDescription || '',
                customerPhoto: customer.customerPhoto || '',
                customerStatus: customer.customerStatus,
            });
        }
    }, [isEdit, customer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setLocalError(null);

        const result = await uploadApi.upload(file);
        setUploading(false);

        if (result.success && result.data?.url) {
            setFormData(prev => ({ ...prev, customerPhoto: result.data!.url }));
        } else {
            setLocalError('Image upload failed');
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, customerPhoto: '' }));
    };

    const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
        if (e) e.preventDefault();
        setLocalError(null);

        if (!formData.customerName.trim()) {
            setLocalError('Customer name is required');
            return;
        }

        let result;
        if (isEdit) {
            result = await updateAction({ id: Number(id), data: formData });
        } else {
            result = await createAction(formData);
        }

        if (result) {
            navigate('/customers');
        }
    };

    if (isEdit && loadingCustomer) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse font-medium">Loading details...</p>
            </div>
        );
    }

    return (
        <div className="bg-background text-foreground font-sans min-h-screen pb-24">
            <HeaderContent title={isEdit ? 'Edit Customer' : 'New Customer'} />

            <main className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-4 pt-4 md:pt-6">
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-foreground tracking-tight mb-2 uppercase">
                        {isEdit ? 'Update Profile' : 'Enroll Customer'}
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium">
                        {isEdit ? 'Update profile information for this customer.' : 'Onboard a new customer to your pasabuy network.'}
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
                        {/* Left Column: Photo & Status */}
                        <div className="lg:col-span-5 space-y-8">
                            {/* Profile Photo */}
                            <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50 transition-all hover:shadow-md">
                                <div className="flex items-center mb-6">
                                    <div className="p-2 rounded-xl bg-primary/10 mr-3">
                                        <ImageIcon className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground tracking-tight">Profile Photo</h3>
                                </div>

                                <div className="space-y-4">
                                    {formData.customerPhoto ? (
                                        <div className="relative aspect-square max-w-[240px] mx-auto group rounded-2xl overflow-hidden border border-border/50 animate-in fade-in zoom-in duration-300">
                                            <img
                                                src={formData.customerPhoto}
                                                alt="Customer"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={removeImage}
                                                    className="p-2 bg-destructive text-destructive-foreground rounded-full hover:scale-110 transition-transform shadow-lg"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-border/60 rounded-2xl hover:border-primary/50 transition-colors cursor-pointer group bg-secondary/20 relative overflow-hidden min-h-[200px]">
                                            <div className="space-y-2 text-center my-auto">
                                                <div className="p-4 rounded-full bg-background/50 inline-block mb-2 group-hover:scale-110 transition-transform">
                                                    <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </div>
                                                <div className="flex text-sm text-muted-foreground justify-center">
                                                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-bold text-primary hover:text-primary-dark transition-colors">
                                                        <span>Upload photo</span>
                                                    </label>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">
                                                    PNG, JPG up to 10MB
                                                </p>
                                            </div>
                                            <input
                                                id="file-upload"
                                                name="file-upload"
                                                type="file"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                onChange={handleFileUpload}
                                                accept="image/*"
                                                disabled={uploading}
                                            />
                                        </div>
                                    )}
                                </div>
                                {uploading && (
                                    <div className="mt-4 flex items-center justify-center gap-3 text-sm text-primary font-bold animate-pulse">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Uploading photo...</span>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Right Column: Details */}
                        <div className="lg:col-span-7 space-y-8">
                            {/* Basic Info */}
                            <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50 transition-all hover:shadow-md">
                                <div className="flex items-center mb-6">
                                    <div className="p-2 rounded-xl bg-primary/10 mr-3">
                                        <UserCircle className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground tracking-tight">Basic Details</h3>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="customerName" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Full Name / Business Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
                                            <input
                                                type="text"
                                                id="customerName"
                                                name="customerName"
                                                value={formData.customerName}
                                                onChange={handleChange}
                                                placeholder="e.g. Juan Dela Cruz"
                                                className="w-full rounded-2xl border-border/60 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/40 py-4 pl-12 pr-4 border outline-none transition-all font-medium"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="customerEmail" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
                                                <input
                                                    type="email"
                                                    id="customerEmail"
                                                    name="customerEmail"
                                                    value={formData.customerEmail || ''}
                                                    onChange={handleChange}
                                                    placeholder="customer@example.com"
                                                    className="w-full rounded-2xl border-border/60 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/40 py-4 pl-12 pr-4 border outline-none transition-all font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="customerPhone" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
                                                <input
                                                    type="tel"
                                                    id="customerPhone"
                                                    name="customerPhone"
                                                    value={formData.customerPhone || ''}
                                                    onChange={handleChange}
                                                    placeholder="+63 ..."
                                                    className="w-full rounded-2xl border-border/60 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/40 py-4 pl-12 pr-4 border outline-none transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Address & Notes */}
                            <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50 transition-all hover:shadow-md">
                                <div className="flex items-center mb-6">
                                    <div className="p-2 rounded-xl bg-primary/10 mr-3">
                                        <MapPin className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground tracking-tight">Additional Info</h3>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="customerAddress" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Delivery Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-4 h-5 w-5 text-muted-foreground/40" />
                                            <textarea
                                                id="customerAddress"
                                                name="customerAddress"
                                                value={formData.customerAddress || ''}
                                                onChange={handleChange}
                                                placeholder="Enter full delivery address..."
                                                rows={3}
                                                className="w-full rounded-2xl border-border/60 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/40 py-4 pl-12 pr-4 border outline-none transition-all resize-none font-medium text-sm"
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="customerDescription" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Notes / Description</label>
                                        <div className="relative">
                                            <FileText className="absolute left-4 top-4 h-5 w-5 text-muted-foreground/40" />
                                            <textarea
                                                id="customerDescription"
                                                name="customerDescription"
                                                value={formData.customerDescription || ''}
                                                onChange={handleChange}
                                                placeholder="Add internal notes about this customer..."
                                                rows={3}
                                                className="w-full rounded-2xl border-border/60 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/40 py-4 pl-12 pr-4 border outline-none transition-all resize-none font-medium text-sm"
                                            ></textarea>
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
                isSaving={mutationLoading || uploading}
                saveLabel={isEdit ? 'Update' : 'Save'}
                saveIcon={Check}
                disabled={mutationLoading || uploading}
            />
        </div>
    );
};
