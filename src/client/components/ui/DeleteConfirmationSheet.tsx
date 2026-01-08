import React from 'react';
import {
    BottomSheet,
    BottomSheetHeader,
    BottomSheetTitle,
    BottomSheetDescription,
    BottomSheetFooter,
} from './BottomSheet';
import { Button } from './button';

interface DeleteConfirmationSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
}

export const DeleteConfirmationSheet: React.FC<DeleteConfirmationSheetProps> = ({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    isLoading = false,
}) => {
    const handleConfirm = () => {
        onConfirm();
        // Let parent handle closing after action completes
    };

    return (
        <BottomSheet open={open} onOpenChange={onOpenChange}>
            <BottomSheetHeader>
                <BottomSheetTitle>{title}</BottomSheetTitle>
                <BottomSheetDescription>{description}</BottomSheetDescription>
            </BottomSheetHeader>

            <BottomSheetFooter>
                <Button
                    variant="destructive"
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

export default DeleteConfirmationSheet;
