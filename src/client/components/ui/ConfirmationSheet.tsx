import React from 'react';
import {
    BottomSheet,
    BottomSheetHeader,
    BottomSheetTitle,
    BottomSheetDescription,
    BottomSheetFooter,
} from './BottomSheet';
import { Button } from './button';

interface ConfirmationSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'destructive' | 'secondary' | 'outline' | 'ghost' | 'link';
    isLoading?: boolean;
}

export const ConfirmationSheet: React.FC<ConfirmationSheetProps> = ({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'default',
    isLoading = false,
}) => {
    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <BottomSheet open={open} onOpenChange={onOpenChange}>
            <BottomSheetHeader>
                <BottomSheetTitle>{title}</BottomSheetTitle>
                <BottomSheetDescription>{description}</BottomSheetDescription>
            </BottomSheetHeader>

            <BottomSheetFooter>
                <Button
                    variant={variant}
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className="w-full h-12 text-base font-medium"
                >
                    {confirmLabel}
                </Button>
                <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isLoading}
                    className="w-full h-12 text-base font-medium"
                >
                    {cancelLabel}
                </Button>
            </BottomSheetFooter>
        </BottomSheet>
    );
};

export default ConfirmationSheet;
