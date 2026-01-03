import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Image as ImageIcon,
    Trash2,
    Loader2,
    Package,
    AlertCircle,
    DollarSign
} from 'lucide-react';
import { useOrder, useOrderMutations } from '@/hooks/useOrders';
import { useStores } from '@/hooks/useStores';
import { useResellers } from '@/hooks/useResellers';
import { uploadApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/utils';
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
            [name]: type === 'number' ? Number(value) : value,
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
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

        // useMutation execute returns T | null - null means error (error is set via hook's error state)
        if (result) {
            navigate('/orders');
        }
        // If result is null, the error was already set by the mutation hook
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
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/orders')} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Orders
                </Button>
                {isEdit && (
                    <Badge variant="outline" className="capitalize">
                        ID: {id}
                    </Badge>
                )}
            </div>

            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    {isEdit ? 'Edit Order' : 'Create New Order'}
                </h1>
                <p className="text-muted-foreground">
                    {isEdit ? 'Update the information for this order.' : 'Add a new pasabuy order to your system.'}
                </p>
            </div>

            {(error || localError) && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {typeof (error || localError) === 'string'
                            ? (error || localError)
                            : 'An error occurred. Please check your input and try again.'}
                    </AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Package className="h-5 w-5 text-primary" />
                                Order Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="orderName">Order Name</Label>
                                <Input
                                    id="orderName"
                                    name="orderName"
                                    placeholder="e.g. 2x Starbucks Coffee Beans"
                                    value={formData.orderName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="orderDescription">Description (Optional)</Label>
                                <textarea
                                    id="orderDescription"
                                    name="orderDescription"
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Add any special instructions or details..."
                                    value={formData.orderDescription || ''}
                                    onChange={handleChange}
                                />
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="storeId">Store</Label>
                                    <Select
                                        value={formData.storeId?.toString()}
                                        onValueChange={(v) => handleSelectChange('storeId', v)}
                                    >
                                        <SelectTrigger id="storeId">
                                            <SelectValue placeholder="Select a store" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {stores?.map(store => (
                                                <SelectItem key={store.id} value={store.id.toString()}>
                                                    {store.storeName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="resellerId">Reseller</Label>
                                    <Select
                                        value={formData.resellerId?.toString()}
                                        onValueChange={(v) => handleSelectChange('resellerId', v)}
                                    >
                                        <SelectTrigger id="resellerId">
                                            <SelectValue placeholder="Select a reseller" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {resellers?.map(reseller => (
                                                <SelectItem key={reseller.id} value={reseller.id.toString()}>
                                                    {reseller.resellerName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-primary" />
                                Pricing & Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="orderQuantity">Quantity</Label>
                                    <Input
                                        id="orderQuantity"
                                        name="orderQuantity"
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={formData.orderQuantity}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="orderFee">Service Fee (PHP)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-bold">₱</span>
                                        <Input
                                            id="orderFee"
                                            name="orderFee"
                                            type="number"
                                            step="0.01"
                                            className="pl-7"
                                            value={formData.orderFee}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic">Your service fee per item</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="orderPrice">Store Price (PHP)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-bold">₱</span>
                                        <Input
                                            id="orderPrice"
                                            name="orderPrice"
                                            type="number"
                                            step="0.01"
                                            className="pl-7"
                                            value={formData.orderPrice}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic">Price per item at store</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="orderResellerPrice">Reseller Price (PHP)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-bold">₱</span>
                                        <Input
                                            id="orderResellerPrice"
                                            name="orderResellerPrice"
                                            type="number"
                                            step="0.01"
                                            className="pl-7"
                                            value={formData.orderResellerPrice}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic">Price per item you charge reseller</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="orderStatus">Status</Label>
                                <Select
                                    value={formData.orderStatus}
                                    onValueChange={(v) => handleSelectChange('orderStatus', v)}
                                >
                                    <SelectTrigger id="orderStatus">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="bought">Bought</SelectItem>
                                        <SelectItem value="packed">Packed</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ImageIcon className="h-4 w-4 text-primary" />
                                Item Photo
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="aspect-square rounded-lg border-2 border-dashed border-muted bg-secondary/30 flex flex-col items-center justify-center relative group overflow-hidden">
                                {formData.orderImage ? (
                                    <>
                                        <img src={formData.orderImage} className="w-full h-full object-cover" alt="Order" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button size="icon" variant="destructive" onClick={() => setFormData(prev => ({ ...prev, orderImage: '' }))} type="button">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-4">
                                        <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                                        <p className="text-xs text-muted-foreground">Upload or drag and drop</p>
                                    </div>
                                )}
                                <Input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                    onChange={handleFileUpload}
                                    accept="image/*"
                                    disabled={uploading}
                                />
                            </div>
                            {uploading && (
                                <div className="flex items-center gap-2 text-xs text-primary animate-pulse">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Uploading...
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="bg-secondary/20 p-4">
                            <p className="text-[10px] text-center w-full text-muted-foreground">PNG, JPG or GIF (max. 10MB)</p>
                        </CardFooter>
                    </Card>

                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-4 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Potential Profit:</span>
                                <span className="font-bold text-emerald-500">
                                    + {formatCurrency(Math.max(0, ((formData.orderResellerPrice || 0) - (formData.orderPrice || 0) - (formData.orderFee || 0)) * (formData.orderQuantity || 1)))}
                                </span>
                            </div>
                            <Button
                                type="submit"
                                className="w-full shadow-lg shadow-primary/20"
                                disabled={mutationLoading || uploading}
                            >
                                {mutationLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        {isEdit ? 'Update Order' : 'Create Order'}
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full"
                                onClick={() => navigate('/orders')}
                                disabled={mutationLoading}
                            >
                                Cancel
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
};
