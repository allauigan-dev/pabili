import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Package,
    Store as StoreIcon,
    User,
    DollarSign,
    Calendar,
    Edit,
    ArrowLeft,
    Image as ImageIcon
} from 'lucide-react';
import { useOrder } from '@/hooks/useOrders';
import { HeaderContent } from '@/components/layout/HeaderProvider';
import { FormActions } from '@/components/ui/FormActions';
import { formatCurrency } from '@/lib/utils';
import { ImageGallery } from '@/components/ui/ImageGallery';
import type { OrderStatus } from '@/lib/types';

export const OrderDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: order, loading } = useOrder(Number(id));
    const [galleryOpen, setGalleryOpen] = useState(false);

    const statusConfig = {
        pending: { color: 'bg-amber-500', label: 'Pending' },
        bought: { color: 'bg-purple-500', label: 'Bought' },
        packed: { color: 'bg-blue-500', label: 'Packed' },
        shipped: { color: 'bg-indigo-500', label: 'Shipped' },
        delivered: { color: 'bg-emerald-500', label: 'Delivered' },
        cancelled: { color: 'bg-red-500', label: 'Cancelled' },
        no_stock: { color: 'bg-gray-500', label: 'No Stock' },
    };

    if (loading || !order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground animate-pulse font-medium">Loading order details...</p>
            </div>
        );
    }

    const status = statusConfig[order.orderStatus as OrderStatus] || statusConfig.pending;

    // Get images array
    const images = order.orderImages && order.orderImages.length > 0
        ? order.orderImages
        : order.orderImage
            ? [order.orderImage]
            : [];

    return (
        <div className="bg-background text-foreground font-sans min-h-screen pb-24">
            <HeaderContent
                title="Order Details"
                actions={
                    <button
                        onClick={() => navigate('/orders')}
                        className="p-2 hover:bg-secondary rounded-full transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                }
            />

            <main className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-4 pt-4 md:pt-6">
                {/* Header Section */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-widest ${status.color}`}>
                                {status.label}
                            </div>
                            <span className="text-sm text-muted-foreground font-medium">#{order.id}</span>
                        </div>
                        <h2 className="text-3xl font-black text-foreground tracking-tight uppercase">
                            {order.orderName}
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-7 space-y-8">
                        {/* Images */}
                        <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50">
                            <div className="flex items-center mb-6">
                                <div className="p-2 rounded-xl bg-primary/10 mr-3">
                                    <ImageIcon className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground tracking-tight">Photos</h3>
                            </div>

                            {images.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {images.map((img, index) => (
                                        <div
                                            key={index}
                                            className="relative aspect-square rounded-2xl overflow-hidden border border-border/50 cursor-zoom-in hover:opacity-90 transition-opacity"
                                            onClick={() => setGalleryOpen(true)}
                                        >
                                            <img
                                                src={img}
                                                alt={`Order ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                    <ImageGallery
                                        images={images}
                                        open={galleryOpen}
                                        onOpenChange={setGalleryOpen}
                                        title={order.orderName}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 bg-secondary/20 rounded-2xl border-2 border-dashed border-border/60">
                                    <ImageIcon className="h-10 w-10 text-muted-foreground opacity-30 mb-2" />
                                    <p className="text-sm text-muted-foreground font-medium">No photos attached</p>
                                </div>
                            )}
                        </div>

                        {/* Basic Info */}
                        <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50">
                            <div className="flex items-center mb-6">
                                <div className="p-2 rounded-xl bg-primary/10 mr-3">
                                    <Package className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground tracking-tight">Information</h3>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Description</label>
                                    <p className="text-base font-medium leading-relaxed">
                                        {order.orderDescription || <span className="text-muted-foreground italic">No description provided</span>}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/50">
                                        <div className="p-2 rounded-xl bg-background shadow-sm">
                                            <StoreIcon className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Store</label>
                                            <p className="font-bold text-lg">{order.storeName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/50">
                                        <div className="p-2 rounded-xl bg-background shadow-sm">
                                            <User className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Customer</label>
                                            <p className="font-bold text-lg">{order.customerName}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Created At</label>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        {new Date(order.createdAt).toLocaleDateString('en-PH', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-8">
                        {/* Financials */}
                        <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50">
                            <div className="flex items-center mb-6">
                                <div className="p-2 rounded-xl bg-primary/10 mr-3">
                                    <DollarSign className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground tracking-tight">Financials</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-secondary/20 border border-border/50 flex justify-between items-center">
                                    <span className="text-sm font-bold text-muted-foreground">Quantity</span>
                                    <span className="text-xl font-black">{order.orderQuantity}x</span>
                                </div>

                                <div className="p-4 rounded-2xl bg-secondary/20 border border-border/50">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-bold text-muted-foreground">Original Price</span>
                                        <span className="text-lg font-bold">{formatCurrency(order.orderPrice)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-muted-foreground">Service Fee</span>
                                        <span className="text-lg font-bold text-emerald-600">+{formatCurrency(order.orderFee)}</span>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
                                    <label className="text-xs font-bold text-primary/70 uppercase tracking-widest block mb-1">Total Customer Price</label>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-primary">{formatCurrency(order.orderCustomerTotal ?? 0)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <FormActions
                onCancel={() => navigate(-1)}
                onSave={() => navigate(`/orders/${id}/edit`)}
                saveLabel="Update"
                saveIcon={Edit}
                cancelLabel="Back"
            />
        </div>
    );
};
