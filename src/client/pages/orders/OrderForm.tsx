import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Image as ImageIcon,
    Upload,
    Package as PackageIcon,
    DollarSign,
    Check,
    AlertCircle,
    Loader2,
    Trash2,
    Minus,
    Plus,
    Truck
} from 'lucide-react';
import { useOrder, useOrderMutations } from '@/hooks/useOrders';
import { useStores } from '@/hooks/useStores';
import { useCustomers } from '@/hooks/useCustomers';
import { uploadApi } from '@/lib/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Combobox } from '@/components/ui/combobox';
import { HeaderContent } from '@/components/layout/HeaderProvider';
import { FormActions } from '@/components/ui/FormActions';
import type { CreateOrderDto, OrderStatus } from '@/lib/types';

const MAX_IMAGES = 5;


export const OrderForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const { data: stores } = useStores();
    const { data: customers } = useCustomers();
    const { data: order, loading: loadingOrder } = useOrder(Number(id));
    const { createAction, updateAction, loading: mutationLoading, error } = useOrderMutations();

    const [formData, setFormData] = useState<CreateOrderDto>({
        orderName: '',
        orderDescription: '',
        orderStatus: 'pending',
        orderQuantity: 1,
        orderPrice: 0,
        orderFee: 0,
        orderCustomerPrice: 0,
        orderImage: '',
        orderImages: [],
        storeId: 0,
        customerId: 0,
    });

    const activeStores = useMemo(() => stores?.filter(store =>
        store.storeStatus === 'active' || store.id === formData.storeId
    ) || [], [stores, formData.storeId]);

    const activeCustomers = useMemo(() => customers?.filter(customer =>
        customer.customerStatus === 'active' || customer.id === formData.customerId
    ) || [], [customers, formData.customerId]);

    const [uploading, setUploading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        if (isEdit && order) {
            setFormData({
                orderName: order.orderName,
                orderDescription: order.orderDescription || '',
                orderStatus: order.orderStatus as OrderStatus,
                orderQuantity: order.orderQuantity,
                orderPrice: order.orderPrice,
                orderFee: order.orderFee,
                orderCustomerPrice: order.orderCustomerPrice,
                orderImage: order.orderImage || '',
                orderImages: order.orderImages || [],
                storeId: order.storeId,
                customerId: order.customerId,
            });
        }
    }, [isEdit, order]);

    const updateQuantity = (amount: number) => {
        setFormData(prev => ({
            ...prev,
            orderQuantity: Math.max(1, (prev.orderQuantity || 1) + amount)
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value,
        }));
    };

    const displayNumber = (value: number | undefined) => {
        return value === 0 || value === undefined ? '' : value;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const currentImages = formData.orderImages || [];
        const remaining = MAX_IMAGES - currentImages.length;

        if (remaining <= 0) {
            setLocalError(`Maximum of ${MAX_IMAGES} images allowed`);
            return;
        }

        const filesToUpload = files.slice(0, remaining);
        setUploading(true);
        setLocalError(null);

        const uploadPromises = filesToUpload.map(file => uploadApi.upload(file));
        const results = await Promise.all(uploadPromises);

        setUploading(false);

        const newImages = [...currentImages];
        let hasError = false;

        results.forEach(result => {
            if (result.success && result.data) {
                newImages.push(result.data.url);
            } else {
                hasError = true;
            }
        });

        if (hasError) {
            setLocalError('Some images failed to upload');
        }

        setFormData(prev => ({
            ...prev,
            orderImages: newImages,
            // Keep first image as primary for backwards compatibility
            orderImage: newImages.length > 0 ? newImages[0] : ''
        }));
    };

    const removeImage = (index: number) => {
        setFormData(prev => {
            const newImages = (prev.orderImages || []).filter((_, i) => i !== index);
            return {
                ...prev,
                orderImages: newImages,
                orderImage: newImages.length > 0 ? newImages[0] : ''
            };
        });
    };

    const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
        if (e) e.preventDefault();
        setLocalError(null);

        if (!formData.storeId || !formData.customerId) {
            setLocalError('Please select both a store and a customer');
            return;
        }

        let result;
        if (isEdit) {
            result = await updateAction({ id: Number(id), data: formData });
        } else {
            result = await createAction(formData);
        }

        if (result) {
            navigate('/orders');
        }
    };

    if (isEdit && loadingOrder) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse font-medium">Loading details...</p>
            </div>
        );
    }

    return (
        <div className="bg-background text-foreground font-sans min-h-screen pb-24">
            {/* Clear header content from previous page */}
            <HeaderContent title={isEdit ? 'Edit Order' : 'New Order'} />

            <main className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-4 pt-4 md:pt-6">
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-foreground tracking-tight mb-2 uppercase">
                        {isEdit ? 'Update Details' : 'Create Order'}
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium">
                        {isEdit ? 'Review and modify the order information below.' : 'Add all necessary details to create a new order.'}
                    </p>
                </div>

                {(error || localError) && (
                    <div className="mb-8">
                        <Alert variant="destructive" className="rounded-2xl border-destructive/20 bg-destructive/5">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle className="font-bold">Action failed</AlertTitle>
                            <AlertDescription className="font-medium">
                                {typeof (error || localError) === 'string'
                                    ? (error || localError)
                                    : 'An error occurred. Please check your input and try again.'}
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-7 space-y-8">
                            {/* Item Photo */}
                            <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50 transition-all hover:shadow-md">
                                <div className="flex items-center mb-6">
                                    <div className="p-2 rounded-xl bg-primary/10 mr-3">
                                        <ImageIcon className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground tracking-tight">Item Photo</h3>
                                </div>

                                <div className="space-y-4">
                                    {/* Current Images Grid */}
                                    {(formData.orderImages && formData.orderImages.length > 0) && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                                            {formData.orderImages.map((img, index) => (
                                                <div key={index} className="relative aspect-square group rounded-2xl overflow-hidden border border-border/50 animate-in fade-in zoom-in duration-300">
                                                    <img
                                                        src={img}
                                                        alt={`Order ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="p-2 bg-destructive text-destructive-foreground rounded-full hover:scale-110 transition-transform shadow-lg"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    {index === 0 && (
                                                        <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                                                            Primary
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Upload Zone */}
                                    {(formData.orderImages?.length || 0) < MAX_IMAGES && (
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-border/60 rounded-2xl hover:border-primary/50 transition-colors cursor-pointer group bg-secondary/20 relative overflow-hidden min-h-[160px]">
                                            <div className="space-y-2 text-center my-auto">
                                                <div className="p-4 rounded-full bg-background/50 inline-block mb-2 group-hover:scale-110 transition-transform">
                                                    <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </div>
                                                <div className="flex text-sm text-muted-foreground justify-center">
                                                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-bold text-primary hover:text-primary-dark transition-colors">
                                                        <span>Upload images</span>
                                                    </label>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">
                                                    {(formData.orderImages?.length || 0)} / {MAX_IMAGES} images • PNG, JPG up to 10MB
                                                </p>
                                            </div>
                                            <input
                                                id="file-upload"
                                                name="file-upload"
                                                type="file"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                onChange={handleFileUpload}
                                                accept="image/*"
                                                multiple
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

                            {/* Order Details */}
                            <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50">
                                <div className="flex items-center mb-6">
                                    <div className="p-2 rounded-xl bg-primary/10 mr-3">
                                        <PackageIcon className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground tracking-tight">Order Details</h3>
                                </div>

                                <div className="mb-6">
                                    <label htmlFor="orderName" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Order Name</label>
                                    <input
                                        type="text"
                                        id="orderName"
                                        name="orderName"
                                        value={formData.orderName}
                                        onChange={handleChange}
                                        placeholder="e.g. 2x Starbucks Coffee Beans"
                                        className="w-full rounded-2xl border-border/60 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/40 py-4 px-4 border outline-none transition-all font-medium"
                                        required
                                    />
                                </div>

                                <div className="mb-6">
                                    <label htmlFor="orderDescription" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Description (Optional)</label>
                                    <textarea
                                        id="orderDescription"
                                        name="orderDescription"
                                        value={formData.orderDescription || ''}
                                        onChange={handleChange}
                                        placeholder="Add any special instructions or details..."
                                        rows={3}
                                        className="w-full rounded-2xl border-border/60 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/40 py-4 px-4 border outline-none transition-all resize-none font-medium text-sm"
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="storeId" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Store</label>
                                        <Combobox
                                            options={activeStores.map(store => ({ label: store.storeName, value: store.id }))}
                                            value={formData.storeId}
                                            onChange={(value) => setFormData(prev => ({ ...prev, storeId: Number(value) }))}
                                            placeholder="Select Store"
                                            searchPlaceholder="Search stores..."
                                            emptyMessage="No store found."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="customerId" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Customer</label>
                                        <Combobox
                                            options={activeCustomers.map(customer => ({ label: customer.customerName, value: customer.id }))}
                                            value={formData.customerId}
                                            onChange={(value) => setFormData(prev => ({ ...prev, customerId: Number(value) }))}
                                            placeholder="Select Customer"
                                            searchPlaceholder="Search customers..."
                                            emptyMessage="No customer found."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-5 space-y-8">
                            {/* Pricing & Status */}
                            <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50">
                                <div className="flex items-center mb-6">
                                    <div className="p-2 rounded-xl bg-primary/10 mr-3">
                                        <DollarSign className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground tracking-tight">Pricing & Status</h3>
                                </div>

                                <div className="space-y-6 mb-6">
                                    {/* Quantity - Large centered stepper */}
                                    <div>
                                        <label htmlFor="orderQuantity" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">Quantity</label>
                                        <div className="flex items-center justify-center gap-4">
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(-1)}
                                                disabled={(formData.orderQuantity ?? 1) <= 1}
                                                className="w-14 h-14 flex items-center justify-center rounded-2xl bg-background border-2 border-border/60 text-foreground hover:bg-secondary hover:border-primary/30 transition-all active:scale-95 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-background disabled:hover:border-border/60"
                                            >
                                                <Minus className="h-6 w-6" />
                                            </button>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    id="orderQuantity"
                                                    name="orderQuantity"
                                                    value={formData.orderQuantity || 1}
                                                    onChange={handleChange}
                                                    min="1"
                                                    className="w-24 h-16 text-center bg-secondary/30 rounded-2xl border-2 border-border/60 text-foreground font-black text-3xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    required
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(1)}
                                                className="w-14 h-14 flex items-center justify-center rounded-2xl bg-primary text-primary-foreground hover:bg-primary-dark transition-all active:scale-95 shadow-lg"
                                            >
                                                <Plus className="h-6 w-6" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Status - Full width with color-coded options */}
                                    {/* Status - Read Only Display */}
                                    {isEdit && formData.orderStatus === 'delivered' ? (
                                        <div className="bg-emerald-500/10 rounded-2xl p-5 border border-emerald-500/20">
                                            <label className="block text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 px-1">Tracking Number</label>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-500 rounded-lg">
                                                    <Truck className="h-5 w-5 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xl font-black text-emerald-900 font-mono tracking-tight">
                                                        {order?.trackingNumber || 'No tracking info'}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mt-0.5">
                                                        Delivered via Shipment #{order?.shipmentId}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">Status</label>
                                            <div className="w-full rounded-2xl border-2 border-border/60 bg-secondary/30 h-16 px-5 flex items-center">
                                                {(() => {
                                                    const statusConfig: Record<string, { color: string, label: string }> = {
                                                        pending: { color: 'bg-amber-500', label: 'Pending' },
                                                        bought: { color: 'bg-purple-500', label: 'Bought' },
                                                        packed: { color: 'bg-blue-500', label: 'Packed' },
                                                        shipped: { color: 'bg-indigo-500', label: 'Shipped' },
                                                        delivered: { color: 'bg-emerald-500', label: 'Delivered' },
                                                        cancelled: { color: 'bg-red-500', label: 'Cancelled' },
                                                        no_stock: { color: 'bg-gray-500', label: 'No Stock' },
                                                    };
                                                    const config = statusConfig[formData.orderStatus || 'pending'] || statusConfig.pending;

                                                    return (
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-3 h-3 rounded-full ${config.color}`} />
                                                            <span className="text-lg font-bold text-foreground">{config.label}</span>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                            <p className="mt-2 text-[10px] text-muted-foreground px-1 uppercase tracking-widest font-black opacity-40">
                                                {isEdit
                                                    ? 'Status can only be updated via workflow actions'
                                                    : 'New orders start as Pending'
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <Separator className="my-6 opacity-30" />

                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="orderFee" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Service Fee</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground font-black text-sm">₱</span>
                                            <input
                                                type="number"
                                                id="orderFee"
                                                name="orderFee"
                                                value={displayNumber(formData.orderFee)}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                                step="0.01"
                                                className="w-full rounded-2xl border-border/60 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary pl-10 py-4 px-4 border outline-none transition-all font-black text-lg"
                                            />
                                        </div>
                                        <p className="mt-2 text-[10px] text-muted-foreground px-1 uppercase tracking-widest font-black opacity-40">Profit per item</p>
                                    </div>

                                    <div>
                                        <label htmlFor="orderPrice" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Store Price</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground font-black text-sm">₱</span>
                                            <input
                                                type="number"
                                                id="orderPrice"
                                                name="orderPrice"
                                                value={displayNumber(formData.orderPrice)}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                                step="0.01"
                                                className="w-full rounded-2xl border-border/60 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary pl-10 py-4 px-4 border outline-none transition-all font-black text-lg"
                                                required
                                            />
                                        </div>
                                        <p className="mt-2 text-[10px] text-muted-foreground px-1 uppercase tracking-widest font-black opacity-40">Original receipt price</p>
                                    </div>

                                    <div>
                                        <label htmlFor="orderCustomerPrice" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Customer Price</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground font-black text-sm">₱</span>
                                            <input
                                                type="number"
                                                id="orderCustomerPrice"
                                                name="orderCustomerPrice"
                                                value={displayNumber(formData.orderCustomerPrice)}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                                step="0.01"
                                                className="w-full rounded-2xl border-border/60 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary pl-10 py-4 px-4 border outline-none transition-all font-black text-lg"
                                                required
                                            />
                                        </div>
                                        <p className="mt-2 text-[10px] text-muted-foreground px-1 uppercase tracking-widest font-black opacity-40">Amount you bill the customer</p>
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
        </div >
    );
};

const Separator = ({ className, opacity }: { className?: string, opacity?: string }) => (
    <div className={`h-[1px] w-full bg-border ${opacity || ''} ${className || ''}`} />
);
