import React from 'react';
import {
    BottomSheet,
    BottomSheetHeader,
    BottomSheetTitle,
} from './BottomSheet';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ActionItem {
    label: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'destructive';
    onAction: () => void;
    disabled?: boolean;
}

interface ActionSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    actions: ActionItem[];
    cancelLabel?: string;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
    open,
    onOpenChange,
    title,
    actions,
    cancelLabel = 'Cancel',
}) => {
    const handleAction = (action: ActionItem) => {
        action.onAction();
        onOpenChange(false);
    };

    return (
        <BottomSheet open={open} onOpenChange={onOpenChange}>
            {title && (
                <BottomSheetHeader>
                    <BottomSheetTitle>{title}</BottomSheetTitle>
                </BottomSheetHeader>
            )}

            <div className="flex flex-col gap-1">
                {actions.map((action, index) => (
                    <Button
                        key={index}
                        variant={action.variant === 'destructive' ? 'destructive' : 'ghost'}
                        onClick={() => handleAction(action)}
                        disabled={action.disabled}
                        className={cn(
                            "w-full h-14 text-base font-medium justify-start gap-3 rounded-xl",
                            action.variant !== 'destructive' && "hover:bg-secondary"
                        )}
                    >
                        {action.icon && (
                            <span className="flex-shrink-0">{action.icon}</span>
                        )}
                        {action.label}
                    </Button>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
                <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="w-full h-12 text-base font-medium"
                >
                    {cancelLabel}
                </Button>
            </div>
        </BottomSheet>
    );
};

export default ActionSheet;
