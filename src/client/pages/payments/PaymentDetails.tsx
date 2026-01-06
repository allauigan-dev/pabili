import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    CreditCard,
    Calendar,
    Edit,
    ArrowLeft,
    Image as ImageIcon,
    User,
    Hash
} from 'lucide-react';
import { usePayment } from '@/hooks/usePayments';
import { HeaderContent } from '@/components/layout/HeaderProvider';
import { FormActions } from '@/components/ui/FormActions';
import { formatCurrency } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
} from '@/components/ui/dialog';

export const PaymentDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: payment, loading } = usePayment(Number(id));

    if (loading || !payment) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground animate-pulse font-medium">Loading payment details...</p>
            </div>
        );
    }

    const statusConfig = {
        pending: { color: 'bg-amber-500', label: 'Pending Assessment' },
        confirmed: { color: 'bg-emerald-500', label: 'Confirmed' },
        rejected: { color: 'bg-rose-500', label: 'Rejected' },
    };

    const status = statusConfig[payment.paymentStatus as keyof typeof statusConfig] || statusConfig.pending;

    return (
        <div className="bg-background text-foreground font-sans min-h-screen pb-24">
            <HeaderContent
                title="Payment Details"
                actions={
                    <button
                        onClick={() => navigate('/payments')}
                        className="p-2 hover:bg-secondary rounded-full transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                }
            />

            <main className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-4 pt-4 md:pt-6">
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-widest ${status.color} shadow-sm`}>
                            {status.label}
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-foreground tracking-tight">
                        {formatCurrency(payment.paymentAmount)}
                    </h2>
                    <p className="text-muted-foreground font-medium">Received amount</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50">
                            <div className="flex items-center mb-6">
                                <div className="p-2 rounded-xl bg-primary/10 mr-3">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground tracking-tight">Transaction Info</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30">
                                    <div className="flex items-center gap-3">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">From</span>
                                    </div>
                                    <span className="font-bold">{payment.customerName}</span>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Date</span>
                                    </div>
                                    <span className="font-bold">{new Date(payment.paymentDate).toLocaleDateString()}</span>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Method</span>
                                    </div>
                                    <span className="font-bold capitalize">{payment.paymentMethod.replace('_', ' ')}</span>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30">
                                    <div className="flex items-center gap-3">
                                        <Hash className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Reference</span>
                                    </div>
                                    <span className="font-bold font-mono">{payment.paymentReference || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50 h-full">
                            <div className="flex items-center mb-6">
                                <div className="p-2 rounded-xl bg-primary/10 mr-3">
                                    <ImageIcon className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground tracking-tight">Proof of Payment</h3>
                            </div>

                            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-secondary/20 border-2 border-dashed border-border/50 flex items-center justify-center">
                                {payment.paymentProof ? (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <img
                                                src={payment.paymentProof}
                                                alt="Payment Proof"
                                                className="w-full h-full object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
                                            />
                                        </DialogTrigger>
                                        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] h-auto max-h-[90vh] p-1 border-none bg-transparent shadow-none">
                                            <DialogTitle className="sr-only">Payment Proof</DialogTitle>
                                            <div className="relative w-full h-full flex items-center justify-center">
                                                <img
                                                    src={payment.paymentProof}
                                                    alt="Proof"
                                                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                                                />
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                ) : (
                                    <div className="text-center p-6">
                                        <ImageIcon className="h-10 w-10 text-muted-foreground opacity-20 mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground font-medium">No proof uploaded</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <FormActions
                onCancel={() => navigate(-1)}
                onSave={() => navigate(`/payments/${id}/edit`)}
                saveLabel="Update"
                saveIcon={Edit}
                cancelLabel="Back"
            />
        </div>
    );
};
