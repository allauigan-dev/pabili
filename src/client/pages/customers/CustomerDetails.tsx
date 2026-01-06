import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    User,
    Mail,
    Phone,
    Edit,
    ArrowLeft,
    Wallet,
    History
} from 'lucide-react';
import { useCustomer } from '@/hooks/useCustomers';
import { HeaderContent } from '@/components/layout/HeaderProvider';
import { FormActions } from '@/components/ui/FormActions';
import { formatCurrency } from '@/lib/utils';

export const CustomerDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: customer, loading } = useCustomer(Number(id));

    if (loading || !customer) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground animate-pulse font-medium">Loading customer details...</p>
            </div>
        );
    }

    const outstandingBalance = customer.balance ?? 0;
    const hasBalance = outstandingBalance > 0;

    return (
        <div className="bg-background text-foreground font-sans min-h-screen pb-24">
            <HeaderContent
                title="Customer Profile"
                actions={
                    <button
                        onClick={() => navigate('/customers')}
                        className="p-2 hover:bg-secondary rounded-full transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                }
            />

            <main className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-4 pt-4 md:pt-6">
                {/* Header Banner */}
                <div className="relative mb-8 rounded-3xl overflow-hidden bg-gradient-to-r from-primary/10 to-purple-500/10 border border-border/50 p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                        <div className="w-24 h-24 rounded-full bg-background p-1 shadow-xl">
                            {customer.customerPhoto ? (
                                <img src={customer.customerPhoto} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center">
                                    <User className="h-10 w-10 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-black text-foreground tracking-tight mb-2">
                                {customer.customerName}
                            </h2>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <div className="flex items-center text-sm font-medium text-muted-foreground bg-background/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                    <Mail className="h-4 w-4 mr-2 text-primary" />
                                    {customer.customerEmail}
                                </div>
                                {customer.customerPhone && (
                                    <div className="flex items-center text-sm font-medium text-muted-foreground bg-background/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                        <Phone className="h-4 w-4 mr-2 text-primary" />
                                        {customer.customerPhone}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Financial Status */}
                    <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50">
                        <div className="flex items-center mb-6">
                            <div className="p-2 rounded-xl bg-emerald-500/10 mr-3">
                                <Wallet className="h-5 w-5 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground tracking-tight">Financial Status</h3>
                        </div>

                        <div className={`p-6 rounded-2xl border-2 ${hasBalance ? 'bg-amber-500/5 border-amber-500/20' : 'bg-emerald-500/5 border-emerald-500/20'} mb-4 text-center`}>
                            <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">
                                {hasBalance ? 'Outstanding Balance' : 'Current Status'}
                            </p>
                            <p className={`text-4xl font-black ${hasBalance ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {formatCurrency(outstandingBalance)}
                            </p>
                            {!hasBalance && (
                                <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                    Fully Paid
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Stats or History Placeholder */}
                    <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50 opacity-60">
                        <div className="flex items-center mb-6">
                            <div className="p-2 rounded-xl bg-blue-500/10 mr-3">
                                <History className="h-5 w-5 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground tracking-tight">History</h3>
                        </div>
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <p className="text-muted-foreground font-medium">Order history coming soon</p>
                        </div>
                    </div>
                </div>
            </main>

            <FormActions
                onCancel={() => navigate(-1)}
                onSave={() => navigate(`/customers/${id}/edit`)}
                saveLabel="Update"
                saveIcon={Edit}
                cancelLabel="Back"
            />
        </div>
    );
};
