import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Input, Select, Spinner } from '../../components';
import { useOrder, useOrderMutations } from '../../hooks/useOrders';
import { useStores } from '../../hooks/useStores';
import { useResellers } from '../../hooks/useResellers';
import { uploadApi } from '../../lib/api';
import type { CreateOrderDto } from '../../lib/types';

export const OrderForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;
    const navigate = useNavigate();

    const { data: order, loading: orderLoading } = useOrder(isEdit ? parseInt(id!) : 0);
    const { data: stores, loading: storesLoading } = useStores();
    const { data: resellers, loading: resellersLoading } = useResellers();
    const { createAction, updateAction, loading: mutationLoading } = useOrderMutations();

    const [formData, setFormData] = useState<CreateOrderDto>({
        orderName: '',
        orderDescription: '',
        orderQuantity: 1,
        orderPrice: 0,
        orderFee: 0,
        orderResellerPrice: 0,
        storeId: 0,
        resellerId: 0,
        orderImage: '',
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (order) {
            setFormData({
                orderName: order.orderName,
                orderDescription: order.orderDescription || '',
                orderQuantity: order.orderQuantity,
                orderPrice: order.orderPrice,
                orderFee: order.orderFee,
                orderResellerPrice: order.orderResellerPrice,
                storeId: order.storeId,
                resellerId: order.resellerId,
                orderImage: order.orderImage || '',
            });
            if (order.orderImage) setPreviewUrl(order.orderImage);
        }
    }, [order]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumber = ['orderQuantity', 'orderPrice', 'orderFee', 'orderResellerPrice', 'storeId', 'resellerId'].includes(name);

        setFormData(prev => ({
            ...prev,
            [name]: isNumber ? (value === '' ? 0 : parseFloat(value)) : value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let imageUrl = formData.orderImage;

        if (imageFile) {
            setIsUploading(true);
            const uploadRes = await uploadApi.upload(imageFile);
            if (uploadRes.success && uploadRes.data) {
                imageUrl = uploadRes.data.url;
            } else {
                alert('Image upload failed: ' + uploadRes.error);
                setIsUploading(false);
                return;
            }
            setIsUploading(false);
        }

        const finalData = { ...formData, orderImage: imageUrl };

        if (isEdit) {
            await updateAction({ id: parseInt(id!), data: finalData });
        } else {
            await createAction(finalData);
        }

        navigate('/orders');
    };

    if (orderLoading || storesLoading || resellersLoading) {
        return <Spinner className="py-20" />;
    }

    const storeOptions = stores?.map(s => ({ value: s.id, label: s.storeName })) || [];
    const resellerOptions = resellers?.map(r => ({ value: r.id, label: r.resellerName })) || [];

    // Calculate totals for preview
    const qty = formData.orderQuantity || 0;
    const price = formData.orderPrice || 0;
    const fee = formData.orderFee || 0;
    const resellerPrice = formData.orderResellerPrice || 0;

    const totalCost = qty * (price + fee);
    const resellerTotal = qty * resellerPrice;
    const profit = resellerTotal - totalCost;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                    ← Back
                </Button>
                <h1 className="text-2xl font-bold">{isEdit ? 'Edit Order' : 'New Order'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <Input
                            label="Order Name"
                            name="orderName"
                            value={formData.orderName}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Starbucks Tumbler"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)] mb-1 block">Description</label>
                        <textarea
                            name="orderDescription"
                            value={formData.orderDescription || ''}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-base transition-all duration-200 ease-out focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 focus:border-[var(--primary)] focus:outline-none hover:border-[var(--border-hover)] h-24 resize-none"
                            placeholder="Add notes, specifications, etc."
                        />
                    </div>

                    <Input
                        label="Quantity"
                        type="number"
                        name="orderQuantity"
                        value={formData.orderQuantity}
                        onChange={handleChange}
                        required
                        min="1"
                    />

                    <Input
                        label="Cost Price (PHP)"
                        type="number"
                        name="orderPrice"
                        value={formData.orderPrice}
                        onChange={handleChange}
                        required
                        step="0.01"
                    />

                    <Input
                        label="Handling Fee (PHP)"
                        type="number"
                        name="orderFee"
                        value={formData.orderFee}
                        onChange={handleChange}
                        required
                        step="0.01"
                    />

                    <Input
                        label="Reseller Price (PHP)"
                        type="number"
                        name="orderResellerPrice"
                        value={formData.orderResellerPrice}
                        onChange={handleChange}
                        required
                        step="0.01"
                    />

                    <Select
                        label="Store"
                        name="storeId"
                        value={formData.storeId}
                        onChange={handleChange}
                        options={storeOptions}
                        required
                    />

                    <Select
                        label="Reseller"
                        name="resellerId"
                        value={formData.resellerId}
                        onChange={handleChange}
                        options={resellerOptions}
                        required
                    />

                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">Product Image</label>
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-[var(--surface-hover)] rounded-lg border-2 border-dashed border-[var(--border)] flex items-center justify-center overflow-hidden">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl">📸</span>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="text-sm text-[var(--text-secondary)] file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--primary-light)] file:text-[var(--primary)] hover:file:bg-[var(--primary)] hover:file:text-white file:transition-all file:duration-200 file:cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-[var(--background)] rounded-lg space-y-2 border border-[var(--border)]">
                    <div className="flex justify-between text-sm">
                        <span>Total Cost (Price + Fee) × Qty:</span>
                        <span className="font-bold">₱{totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Total Reseller Price:</span>
                        <span className="font-bold">₱{resellerTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-[var(--border)]">
                        <span className="font-bold">Estimated Profit:</span>
                        <span className={`font-bold ${profit >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                            ₱{profit.toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="ghost" type="button" onClick={() => navigate(-1)} disabled={mutationLoading || isUploading}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        isLoading={mutationLoading || isUploading}
                        disabled={mutationLoading || isUploading}
                    >
                        {isEdit ? 'Update Order' : 'Create Order'}
                    </Button>
                </div>
            </form>
        </div>
    );
};
