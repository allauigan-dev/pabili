import React from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FormActionsProps {
    onCancel: () => void;
    onSave?: () => void;
    isSaving?: boolean;
    saveLabel?: string;
    cancelLabel?: string;
    disabled?: boolean;
    saveIcon?: React.ElementType;
    className?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
    onCancel,
    onSave,
    isSaving = false,
    saveLabel = 'Save',
    cancelLabel = 'Cancel',
    disabled = false,
    saveIcon: Icon = Save,
    className
}) => {
    const content = (
        <nav
            className={cn(
                "fixed bottom-0 left-0 right-0 z-50 border-t bg-card/80 backdrop-blur-lg",
                className
            )}
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
            <div className="flex items-center gap-3 px-4 py-3 w-full max-w-4xl mx-auto">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={disabled || isSaving}
                    className="flex-1 h-11 rounded-xl font-bold"
                >
                    {cancelLabel}
                </Button>
                <Button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        if (onSave) {
                            onSave();
                        } else {
                            // Find and submit the form
                            const form = document.querySelector('form');
                            if (form) {
                                form.requestSubmit();
                            }
                        }
                    }}
                    disabled={disabled || isSaving}
                    className="flex-1 h-11 rounded-xl font-bold shadow-lg shadow-primary/20"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            {Icon && <Icon className="mr-2 h-4 w-4" />}
                            <span>{saveLabel}</span>
                        </>
                    )}
                </Button>
            </div>
        </nav>
    );

    // Use portal to render outside the scrolling container
    return createPortal(content, document.body);
};
