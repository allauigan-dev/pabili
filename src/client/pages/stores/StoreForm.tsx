import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Save,
    Store as StoreIcon,
    MapPin,
    Phone,
    Loader2,
    AlertCircle,
    Building2,
    Info
} from 'lucide-react';
import { useStore, useStoreMutations } from '@/hooks/useStores';
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
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { CreateStoreDto } from '@/lib/types';
import { HeaderContent } from '@/components/layout/HeaderProvider';

export const StoreForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const { data: store, loading: loadingStore } = useStore(Number(id));
    const { createAction, updateAction, loading: mutationLoading, error } = useStoreMutations();

    const [formData, setFormData] = useState<CreateStoreDto>({
        storeName: '',
        storeAddress: '',
        storePhone: '',
        storeStatus: 'active',
    });

    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        if (isEdit && store) {
            setFormData({
                storeName: store.storeName,
                storeAddress: store.storeAddress || '',
                storePhone: store.storePhone || '',
                storeStatus: store.storeStatus,
            });
        }
    }, [isEdit, store]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = (value: string) => {
        setFormData(prev => ({ ...prev, storeStatus: value as 'active' | 'inactive' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        let result;
        if (isEdit) {
            result = await updateAction({ id: Number(id), data: formData });
        } else {
            result = await createAction(formData);
        }

        if (result) {
            navigate('/stores');
        } else {
            setLocalError('Failed to save store. Please check the information and try again.');
        }
    };

    if (isEdit && loadingStore) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading store data...</p>
            </div>
        );
    }

    return (
        <div className="bg-background text-foreground font-sans min-h-screen pb-24">
            {/* Clear header content from previous page */}
            <HeaderContent title={isEdit ? 'Edit Store' : 'New Store'} />

            <main className="max-w-md md:max-w-2xl mx-auto px-4 pt-4 md:pt-6">
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-foreground tracking-tight mb-2 uppercase">
                        {isEdit ? 'Update Store' : 'Add Store'}
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium">
                        {isEdit ? 'Update your shopping location details.' : 'Register a new store for your pasabuy orders.'}
                    </p>
                </div>

                {(error || localError) && (
                    <Alert variant="destructive" className="animate-in head-shake duration-300">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Action failed</AlertTitle>
                        <AlertDescription>{error || localError}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Card className="border-none shadow-xl bg-gradient-to-br from-card to-secondary/30 overflow-hidden pt-0">
                        <CardHeader className="border-b bg-muted/40 pt-6 pb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle>Store Information</CardTitle>
                                    <CardDescription>Basic details about the shopping center or shop.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="storeName" className="font-semibold">Store Name</Label>
                                    <div className="relative">
                                        <StoreIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="storeName"
                                            name="storeName"
                                            className="pl-10"
                                            placeholder="e.g. SM Megamall, Costco, IKEA"
                                            value={formData.storeName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="storeAddress" className="font-semibold">Location</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="storeAddress"
                                            name="storeAddress"
                                            className="pl-10"
                                            placeholder="City, Mall wing, or full address"
                                            value={formData.storeAddress || ''}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="storePhone" className="font-semibold">Contact Info</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="storePhone"
                                                name="storePhone"
                                                className="pl-10"
                                                placeholder="Phone or social media"
                                                value={formData.storePhone || ''}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="storeStatus" className="font-semibold">Status</Label>
                                        <Select
                                            value={formData.storeStatus}
                                            onValueChange={handleStatusChange}
                                        >
                                            <SelectTrigger id="storeStatus" className="bg-background">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <Alert className="bg-primary/5 border-primary/20 text-xs py-3">
                                <Info className="h-4 w-4 text-primary" />
                                <AlertDescription>
                                    Active stores are shown by default in your order creation forms.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                        <CardFooter className="p-8 pt-0 flex flex-col sm:flex-row gap-4">
                            <Button
                                type="submit"
                                className="w-full sm:flex-1 h-11"
                                disabled={mutationLoading}
                            >
                                {mutationLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        {isEdit ? 'Update Store' : 'Add Store'}
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full sm:w-auto h-11"
                                onClick={() => navigate('/stores')}
                                disabled={mutationLoading}
                            >
                                Cancel
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </main>
        </div>
    );
};
