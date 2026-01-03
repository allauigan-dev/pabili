import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Image as ImageIcon,
    Upload,
    Package as PackageIcon,
    DollarSign,
    ChevronDown,
    Check,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { useOrder, useOrderMutations } from '@/hooks/useOrders';
import { useStores } from '@/hooks/useStores';
import { useResellers } from '@/hooks/useResellers';
import { uploadApi } from '@/lib/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { CreateOrderDto, OrderStatus } from '@/lib/types';

export const OrderForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const { data: stores } = useStores();
    const { data: resellers } = useResellers();
    const { data: order, loading: loadingOrder } = useOrder(Number(id));
    const { createAction, updateAction, loading: mutationLoading, error } = useOrderMutations();

    const [formData, setFormData] = useState<CreateOrderDto>({
        orderName: '',
        orderDescription: '',
        orderStatus: 'pending',
        orderQuantity: 1,
        orderPrice: 0,
        orderFee: 0,
        orderResellerPrice: 0,
        orderImage: '',
        storeId: 0,
        resellerId: 0,
    });

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
                orderResellerPrice: order.orderResellerPrice,
                orderImage: order.orderImage || '',
                storeId: order.storeId,
                resellerId: order.resellerId,
            });
        }
    }, [isEdit, order]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value,
        }));
    };

    // Helper to display number inputs - shows empty string instead of 0
    const displayNumber = (value: number | undefined) => {
        return value === 0 || value === undefined ? '' : value;
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name.endsWith('Id') ? Number(value) : value,
        }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setLocalError(null);
        const result = await uploadApi.upload(file);
        setUploading(false);

        if (result.success && result.data) {
            setFormData(prev => ({ ...prev, orderImage: result.data!.url }));
        } else {
            setLocalError(result.error || 'Failed to upload image');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        // Validation
        if (!formData.storeId || !formData.resellerId) {
            setLocalError('Please select both a store and a reseller');
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
                <p className="text-muted-foreground animate-pulse">Loading order details...</p>
            </div>
        );
    }

    return (
        <div className="bg-background text-foreground font-sans min-h-screen pb-24">
            {/* Header */}
            <header className="fixed top-0 w-full z-10 bg-card border-b border-border shadow-sm">
                <div className="max-w-md mx-auto px-4 h-16 flex items-center">
                    <button
                        onClick={() => navigate('/orders')}
                        className="mr-4 text-foreground hover:text-primary transition-colors flex items-center justify-center"
                        type="button"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <h1 className="text-lg font-semibold">Back to Orders</h1>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 pt-20">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground mb-1">
                        {isEdit ? 'Edit Order' : 'Create New Order'}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        {isEdit ? 'Update the information for this order.' : 'Add a new pasabuy order to your system.'}
                    </p>
                </div>

                {(error || localError) && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {typeof (error || localError) === 'string'
                                ? (error || localError)
                                : 'An error occurred. Please check your input and try again.'}
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Item Photo */}
                    <div className="bg-card rounded-2xl p-5 mb-4 shadow-sm border border-border">
                        <div className="flex items-center mb-5 text-primary">
                            <ImageIcon className="mr-2 h-6 w-6" />
                            <h3 className="text-lg font-bold text-foreground">Item Photo</h3>
                        </div>

                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-border rounded-xl hover:border-primary transition-colors cursor-pointer group bg-background relative overflow-hidden">
                            {formData.orderImage ? (
                                <div className="relative w-full aspect-video">
                                    <img
                                        src={formData.orderImage}
                                        alt="Order"
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white font-medium">Click to change</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-1 text-center">
                                    <Upload className="mx-auto h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <div className="flex text-sm text-muted-foreground justify-center">
                                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-purple-500 focus-within:outline-none">
                                            <span>Upload a file</span>
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        PNG, JPG, GIF up to 10MB
                                    </p>
                                </div>
                            )}
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
                        {uploading && (
                            <div className="mt-2 flex items-center justify-center gap-2 text-sm text-primary">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Uploading...</span>
                            </div>
                        )}
                    </div>

                    {/* Order Details */}
                    <div className="bg-card rounded-2xl p-5 mb-4 shadow-sm border border-border">
                        <div className="flex items-center mb-5 text-primary">
                            <PackageIcon className="mr-2 h-6 w-6" />
                            <h3 className="text-lg font-bold text-foreground">Order Details</h3>
                        </div>

                        <div className="mb-5">
                            <label htmlFor="orderName" className="block text-sm font-medium text-foreground mb-1.5">Order Name</label>
                            <input
                                type="text"
                                id="orderName"
                                name="orderName"
                                value={formData.orderName}
                                onChange={handleChange}
                                placeholder="e.g. 2x Starbucks Coffee Beans"
                                className="w-full rounded-xl border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary placeholder-muted-foreground py-3 px-4 border outline-none transition-all placeholder:text-muted-foreground"
                                required
                            />
                        </div>

                        <div className="mb-5">
                            <label htmlFor="orderDescription" className="block text-sm font-medium text-foreground mb-1.5">Description (Optional)</label>
                            <textarea
                                id="orderDescription"
                                name="orderDescription"
                                value={formData.orderDescription || ''}
                                onChange={handleChange}
                                placeholder="Add any special instructions or details..."
                                rows={3}
                                className="w-full rounded-xl border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary placeholder-muted-foreground py-3 px-4 border outline-none transition-all resize-none placeholder:text-muted-foreground"
                            ></textarea>
                        </div>

                        <div className="mb-5">
                            <label htmlFor="storeId" className="block text-sm font-medium text-foreground mb-1.5">Store</label>
                            <div className="relative">
                                <select
                                    id="storeId"
                                    name="storeId"
                                    value={formData.storeId}
                                    onChange={handleSelectChange}
                                    className="w-full rounded-xl border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary appearance-none py-3 pl-4 pr-10 border outline-none transition-all"
                                    required
                                >
                                    <option value={0} disabled>Select Store</option>
                                    {stores?.map(store => (
                                        <option key={store.id} value={store.id}>{store.storeName}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 pointer-events-none" />
                            </div>
                        </div>

                        <div className="mb-0">
                            <label htmlFor="resellerId" className="block text-sm font-medium text-foreground mb-1.5">Reseller</label>
                            <div className="relative">
                                <select
                                    id="resellerId"
                                    name="resellerId"
                                    value={formData.resellerId}
                                    onChange={handleSelectChange}
                                    className="w-full rounded-xl border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary appearance-none py-3 pl-4 pr-10 border outline-none transition-all"
                                    required
                                >
                                    <option value={0} disabled>Select Reseller</option>
                                    {resellers?.map(reseller => (
                                        <option key={reseller.id} value={reseller.id}>{reseller.resellerName}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Status */}
                    <div className="bg-card rounded-2xl p-5 mb-8 shadow-sm border border-border">
                        <div className="flex items-center mb-5 text-primary">
                            <DollarSign className="mr-2 h-6 w-6" />
                            <h3 className="text-lg font-bold text-foreground">Pricing & Status</h3>
                        </div>

                        <div className="mb-5">
                            <label htmlFor="orderQuantity" className="block text-sm font-medium text-foreground mb-1.5">Quantity</label>
                            <input
                                type="number"
                                id="orderQuantity"
                                name="orderQuantity"
                                value={formData.orderQuantity || ''}
                                onChange={handleChange}
                                min="1"
                                className="w-full rounded-xl border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary py-3 px-4 border outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="mb-5">
                            <label htmlFor="orderFee" className="block text-sm font-medium text-foreground mb-1.5">Service Fee (PHP)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-bold">₱</span>
                                <input
                                    type="number"
                                    id="orderFee"
                                    name="orderFee"
                                    value={displayNumber(formData.orderFee)}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    className="w-full rounded-xl border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary pl-8 py-3 px-4 border outline-none transition-all"
                                />
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">Your service fee per item</p>
                        </div>

                        <div className="mb-5">
                            <label htmlFor="orderPrice" className="block text-sm font-medium text-foreground mb-1.5">Store Price (PHP)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-bold">₱</span>
                                <input
                                    type="number"
                                    id="orderPrice"
                                    name="orderPrice"
                                    value={displayNumber(formData.orderPrice)}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    className="w-full rounded-xl border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary pl-8 py-3 px-4 border outline-none transition-all"
                                    required
                                />
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">Price per item at store</p>
                        </div>

                        <div className="mb-5">
                            <label htmlFor="orderResellerPrice" className="block text-sm font-medium text-foreground mb-1.5">Reseller Price (PHP)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-bold">₱</span>
                                <input
                                    type="number"
                                    id="orderResellerPrice"
                                    name="orderResellerPrice"
                                    value={displayNumber(formData.orderResellerPrice)}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    className="w-full rounded-xl border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary pl-8 py-3 px-4 border outline-none transition-all"
                                    required
                                />
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">Price per item you charge reseller</p>
                        </div>

                        <div className="mb-0">
                            <label htmlFor="orderStatus" className="block text-sm font-medium text-foreground mb-1.5">Status</label>
                            <div className="relative">
                                <select
                                    id="orderStatus"
                                    name="orderStatus"
                                    value={formData.orderStatus}
                                    onChange={handleSelectChange}
                                    className="w-full rounded-xl border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary appearance-none py-3 pl-4 pr-10 border outline-none transition-all"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="bought">Bought</option>
                                    <option value="packed">Packed</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="no_stock">No Stock</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="mb-12">
                        <button
                            type="submit"
                            disabled={mutationLoading || uploading}
                            className="w-full bg-primary hover:bg-violet-700 text-primary-foreground font-bold py-4 px-6 rounded-2xl shadow-lg transform transition active:scale-95 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {mutationLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Check className="mr-2 h-6 w-6" />
                                    <span>{isEdit ? 'Update Order' : 'Create Order'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};
